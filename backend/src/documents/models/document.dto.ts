import {IsString, IsOptional, IsUUID, MinLength, MaxLength, IsEnum} from 'class-validator';
import {PermissionLevel} from "./document-share.entity";

export class CreateFolderDto {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsUUID('4')
    parentFolderId?: string;
}

export class CreateTextDocDto {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsUUID('4')
    parentFolderId?: string;
}

export class UploadFileDto {
    @IsOptional()
    @IsUUID('4')
    parentFolderId?: string;
}

export class ShareDocumentDto {
    @IsUUID('4')
    targetUserId: string;

    @IsEnum(PermissionLevel)
    permission: PermissionLevel;
}