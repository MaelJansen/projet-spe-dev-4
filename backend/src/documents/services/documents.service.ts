import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity, DocumentType } from '../models/document.entity';
import {CreateFolderDto, CreateTextDocDto} from "../models/document.dto";

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(DocumentEntity)
        private documentsRepository: Repository<DocumentEntity>,
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
            createdBy: { id: userId } as any,
            lastModifiedBy: { id: userId } as any
        });

        return await this.documentsRepository.save(newDoc);
    }
}