import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {IsNull, Not, Repository} from 'typeorm';
import { DocumentEntity, DocumentType } from '../models/document.entity';
import {CreateFolderDto, CreateTextDocDto, UploadFileDto} from "../models/document.dto";
import {StorageService} from "./storage.service";
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(DocumentEntity)
        private documentsRepository: Repository<DocumentEntity>,
        private storageService: StorageService,
    ) {}

    async getDocumentsByFolder(folderId?: string): Promise<DocumentEntity[]> {
        const queryBuilder = this.documentsRepository.createQueryBuilder('document')
            .leftJoinAndSelect('document.lastModifiedBy', 'lastModifiedBy')
            .select([
                'document.id',
                'document.name',
                'document.type',
                'document.fileUrl',
                'document.updatedAt',
                'lastModifiedBy.id',
                'lastModifiedBy.name',
                'lastModifiedBy.lastName',
                'lastModifiedBy.email'
            ]);

        if (folderId) {
            const parentFolder = await this.documentsRepository.findOne({
                where: { id: folderId, type: DocumentType.FOLDER }
            });
            if (!parentFolder) throw new NotFoundException('Target folder not found');

            queryBuilder.where('document.parentFolder = :folderId', { folderId });
        } else {
            queryBuilder.where('document.parentFolder IS NULL');
        }

        return await queryBuilder
            .orderBy('document.type', 'ASC')
            .addOrderBy('document.name', 'ASC')
            .getMany();
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

    async getTrash(): Promise<DocumentEntity[]> {
        return await this.documentsRepository.find({
            where: {deletedAt: Not(IsNull())},
            withDeleted: true,
            relations: { lastModifiedBy: true },
            select: {
                id: true,
                name: true,
                type: true,
                deletedAt: true,
                lastModifiedBy: {
                    id: true,
                    name: true,
                    lastName: true,
                }
            },
            order: {
                deletedAt: 'DESC'
            }
        });
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