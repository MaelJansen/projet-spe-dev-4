import {IsString, IsOptional, MinLength, IsNotEmpty} from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    lastName?: string;
}

export class UpdatePasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}