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
import {CreateFolderDto, CreateTextDocDto, UploadFileDto} from "../models/document.dto";
import {FileInterceptor} from "@nestjs/platform-express";

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get()
    async getRootDocuments() {
        return await this.documentsService.getDocumentsByFolder();
    }

    @Get('trash')
    async getTrash() {
        return await this.documentsService.getTrash();
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
    async getFolderDocuments(@Param('folderId') folderId: string) {
        return await this.documentsService.getDocumentsByFolder(folderId);
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
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {
                fileSize: 1024 * 1024 * 10,
            },
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|docx|xlsx|pptx|txt)$/i)) {
                    return callback(
                        new BadRequestException('Forbidden extension. Only images, PDFs, and Office documents are allowed.'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    async uploadFile(
        @Req() req: RequestWithUser,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|docx|xlsx|pptx|txt)$/i })
                .addMaxSizeValidator({ maxSize: 1024 * 1024 * 10 }) // 10 MB
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        ) file: Express.Multer.File,
        @Body() uploadFileDto: UploadFileDto,
    ) {

        if (!file) {
            throw new BadRequestException('File is required');
        }

        const fileSignature = await fileTypeFromBuffer(file.buffer);

        if (!fileSignature || !fileSignature.mime.match(/(image|pdf|officedocument|text)/i)) {
            throw new BadRequestException('Invalid File type');
        }
        return await this.documentsService.uploadImportedFile(req.user.id, file, uploadFileDto);
    }
}