import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {DocumentEntity} from "./models/document.entity";
import {DocumentsController} from "./controllers/documents.controller";
import {DocumentsService} from "./services/documents.service";
import {StorageService} from "./services/storage.service";

@Module({
    imports: [TypeOrmModule.forFeature([DocumentEntity])],
    controllers: [DocumentsController],
    providers: [DocumentsService, StorageService],
})
export class DocumentsModule {}
