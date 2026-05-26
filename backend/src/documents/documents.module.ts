import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {DocumentEntity} from "./models/document.entity";
import {DocumentsController} from "./controllers/documents.controller";
import {DocumentsService} from "./services/documents.service";

@Module({
    imports: [TypeOrmModule.forFeature([DocumentEntity])],
    controllers: [DocumentsController],
    providers: [DocumentsService],
})
export class DocumentsModule {}
