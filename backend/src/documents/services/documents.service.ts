import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {IsNull, Not, Repository} from 'typeorm';
import { DocumentEntity, DocumentType } from '../models/document.entity';
import {CreateFolderDto, CreateTextDocDto, ShareDocumentDto, UploadFileDto} from "../models/document.dto";
import {StorageService} from "./storage.service";
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {DocumentShareEntity} from "../models/document-share.entity";

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(DocumentEntity)
        private documentsRepository: Repository<DocumentEntity>,
        @InjectRepository(DocumentShareEntity)
        private shareRepository: Repository<DocumentShareEntity>,
        private storageService: StorageService,
    ) {}

    private async streamToText(stream: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            stream.on('data', (chunk: any) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        });
    }

    async getDocumentsByFolder(userId: string, folderId?: string): Promise<DocumentEntity[]> {
        const queryBuilder = this.documentsRepository.createQueryBuilder('document')
            .leftJoinAndSelect('document.lastModifiedBy', 'lastModifiedBy')
            .leftJoin('document_shares', 'share', 'share.document = document.id AND share.user = :userId', { userId })
            .where('(document.createdBy = :userId OR share.id IS NOT NULL)')
            .andWhere('document.deletedAt IS NULL');

        if (folderId) {
            queryBuilder.andWhere('document.parentFolder = :folderId', { folderId });
        } else {
            queryBuilder.andWhere('document.parentFolder IS NULL');
        }

        return await queryBuilder.getMany();
    }

    async shareDocument(ownerId: string, documentId: string, shareDocumentDto: ShareDocumentDto): Promise<DocumentShareEntity> {
        const doc = await this.documentsRepository.findOne({ where: { id: documentId, createdBy: { id: ownerId } } });
        if (!doc) throw new NotFoundException('Document not found or access denied');

        const share = this.shareRepository.create({
            document: { id: documentId },
            user: { id: shareDocumentDto.targetUserId },
            permission: shareDocumentDto.permission
        });

        return await this.shareRepository.save(share);
    }

    async convertFileToEditable(userId: string, documentId: string): Promise<DocumentEntity> {
        const doc = await this.documentsRepository.findOne({ where: { id: documentId } });
        if (!doc || doc.type !== DocumentType.IMPORTED_FILE || doc.fileUrl === null) {
            throw new BadRequestException('Only imported files can be converted.');
        }

        const fileKey = doc.fileUrl.split('/').pop();

        if (!fileKey) {
            throw new BadRequestException('Invalid file URL');
        }

        const fileStream = await this.storageService.downloadFile(fileKey);

        const content = await this.streamToText(fileStream);

        const newEditableDoc = this.documentsRepository.create({
            name: `${doc.name} (Editable)`,
            type: DocumentType.TEXT_DOC,
            content: content,
            parentFolder: doc.parentFolder,
            createdBy: { id: userId } as any,
            lastModifiedBy: { id: userId } as any
        });

        return await this.documentsRepository.save(newEditableDoc);
    }

    async createFolder(userId: string, createFolderDto: CreateFolderDto): Promise<DocumentEntity> {
        const { name, parentFolderId } = createFolderDto;
        let parentFolder: DocumentEntity | null = null;

        if (parentFolderId) {
            parentFolder = await this.documentsRepository.findOne({
                where: { id: parentFolderId }
            });

            if (!parentFolder) {
                throw new NotFoundException('The specified parent folder does not exist');
            }

            if (parentFolder.type !== DocumentType.FOLDER) {
                throw new BadRequestException('The parent element must be a folder, not a file');
            }
        }
        const newFolder = this.documentsRepository.create({
            name,
            type: DocumentType.FOLDER,
            parentFolder: parentFolder,
            createdBy: { id: userId },
            lastModifiedBy: { id: userId }
        });

        return await this.documentsRepository.save(newFolder);
    }

    async createTextDocument(userId: string, createTextDocDto: CreateTextDocDto): Promise<DocumentEntity> {
        const { name, parentFolderId } = createTextDocDto;
        let parentFolder: DocumentEntity | null = null;

        if (parentFolderId) {
            parentFolder = await this.documentsRepository.findOne({ where: { id: parentFolderId } });
            if (!parentFolder) throw new NotFoundException('The specified parent folder does not exist');
            if (parentFolder.type !== DocumentType.FOLDER) {
                throw new BadRequestException('The parent element must be a folder');
            }
        }
        const newDoc = this.documentsRepository.create({
            name,
            type: DocumentType.TEXT_DOC,
            content: '',
            fileUrl: null,
            parentFolder,
            createdBy: { id: userId },
            lastModifiedBy: { id: userId }
        });

        return await this.documentsRepository.save(newDoc);
    }

    async deleteDocument(userId: string, documentId: string): Promise<void> {
        const document = await this.documentsRepository.findOne({ where: { id: documentId } });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        await this.documentsRepository.update(documentId, {
            lastModifiedBy: { id: userId }
        });

        await this.documentsRepository.softDelete(documentId);
    }

    async restoreDocument(userId: string, documentId: string): Promise<void> {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId },
            withDeleted: true
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }
        if (!document.deletedAt) {
            throw new BadRequestException('This document is not in the trash');
        }

        await this.documentsRepository.restore(documentId);

        await this.documentsRepository.update(documentId, {
            lastModifiedBy: { id: userId }
        });
    }

    async getTrash(userId: string): Promise<DocumentEntity[]> {
        return await this.documentsRepository.createQueryBuilder('document')
            .leftJoinAndSelect('document.lastModifiedBy', 'lastModifiedBy')
            .leftJoin('document_shares', 'share', 'share.documentId = document.id AND share.userId = :userId', { userId })
            .where('document.deletedAt IS NOT NULL')
            .andWhere('(document.createdById = :userId OR share.id IS NOT NULL)')
            .orderBy('document.deletedAt', 'DESC')
            .getMany();
    }

    async uploadImportedFile(
        userId: string,
        file: Express.Multer.File,
        uploadFileDto: UploadFileDto
    ): Promise<DocumentEntity> {
        const { parentFolderId } = uploadFileDto;
        let parentFolder: DocumentEntity | null = null;

        if (parentFolderId) {
            parentFolder = await this.documentsRepository.findOne({ where: { id: parentFolderId } });
            if (!parentFolder) throw new NotFoundException('The specified parent folder does not exist');
            if (parentFolder.type !== DocumentType.FOLDER) {
                throw new BadRequestException('The parent element must be a folder');
            }
        }

        const uniqueFilename = `${uuidv4()}${extname(file.originalname)}`;

        const fileUrl = await this.storageService.uploadFile(uniqueFilename, file.buffer, file.mimetype);

        const newFile = this.documentsRepository.create({
            name: file.originalname,
            type: DocumentType.IMPORTED_FILE,
            fileUrl: fileUrl,
            content: null,
            parentFolder,
            createdBy: { id: userId },
            lastModifiedBy: { id: userId }
        });

        return await this.documentsRepository.save(newFile);
    }
}