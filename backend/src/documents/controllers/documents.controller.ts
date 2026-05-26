import {
    BadRequestException,
    Body,
    Controller, Delete,
    Get, HttpStatus,
    Param, ParseFilePipeBuilder,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import {JwtAuthGuard} from "../../common/guards/jwt-auth-guard";
import type {RequestWithUser} from "../../common/interfaces/active-user.interface";
import { fileTypeFromBuffer } from 'file-type';
import {CreateFolderDto, CreateTextDocDto, ShareDocumentDto, UploadFileDto} from "../models/document.dto";
import {FileInterceptor} from "@nestjs/platform-express";

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get()
    async getRootDocuments(@Req() req: RequestWithUser) {
        return await this.documentsService.getDocumentsByFolder(req.user.id);
    }

    @Get('trash')
    async getTrash(@Req() req: RequestWithUser) {
        return await this.documentsService.getTrash(req.user.id);
    }

    @Delete(':id')
    async deleteDocument(
        @Req() req: RequestWithUser,
        @Param('id') id: string
    ) {
        await this.documentsService.deleteDocument(req.user.id, id);
        return { message: 'Document moved to trash successfully' };
    }

    @Get(':folderId')
    async getFolderDocuments(@Req() req: RequestWithUser, @Param('folderId') folderId: string) {
        return await this.documentsService.getDocumentsByFolder(req.user.id, folderId);
    }

    @Post(':id/share')
    async shareDocument(
        @Req() req: RequestWithUser,
        @Param('id') id: string,
        @Body() shareDocumentDto: ShareDocumentDto
    ) {
        return await this.documentsService.shareDocument(req.user.id, id, shareDocumentDto);
    }

    @Post(':id/convert')
    async convertFile(@Req() req: RequestWithUser, @Param('id') id: string) {
        return await this.documentsService.convertFileToEditable(req.user.id, id);
    }

    @Post(':id/restore')
    async restoreDocument(
        @Req() req: RequestWithUser,
        @Param('id') id: string
    ) {
        await this.documentsService.restoreDocument(req.user.id, id);
        return { message: 'Document restored successfully' };
    }

    @Post('folders')
    async createFolder(
        @Req() req: RequestWithUser,
        @Body() createFolderDto: CreateFolderDto
    ) {
        return await this.documentsService.createFolder(req.user.id, createFolderDto);
    }

    @Post('text')
    async createTextDocument(
        @Req() req: RequestWithUser,
        @Body() createTextDocDto: CreateTextDocDto
    ) {
        return await this.documentsService.createTextDocument(req.user.id, createTextDocDto);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Req() req: RequestWithUser,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({
                    maxSize: 1024 * 1024 * 10, // 10 MB
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        file: Express.Multer.File,
        @Body() uploadFileDto: UploadFileDto,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type');
        }

        if (file.mimetype !== 'text/plain') {
            const fileSignature = await fileTypeFromBuffer(file.buffer);

            if (!fileSignature) {
                throw new BadRequestException('Invalid file signature');
            }

            const allowedSignatures = [
                'image/jpeg',
                'image/png',
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ];

            if (!allowedSignatures.includes(fileSignature.mime)) {
                throw new BadRequestException('Invalid file signature');
            }
        }

        return await this.documentsService.uploadImportedFile(
            req.user.id,
            file,
            uploadFileDto,
        );
    }
}