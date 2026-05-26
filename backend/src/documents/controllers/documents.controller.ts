import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import {JwtAuthGuard} from "../../common/guards/jwt-auth-guard";
import type {RequestWithUser} from "../../common/interfaces/active-user.interface";
import {CreateFolderDto, CreateTextDocDto} from "../models/document.dto";

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get()
    async getRootDocuments() {
        return await this.documentsService.getDocumentsByFolder();
    }

    @Get(':folderId')
    async getFolderDocuments(@Param('folderId') folderId: string) {
        return await this.documentsService.getDocumentsByFolder(folderId);
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
}