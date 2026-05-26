import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

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