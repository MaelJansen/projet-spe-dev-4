import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {S3Client, PutObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const endpoint = this.configService.get<string>('minioEndpoint');
        const accessKeyId = this.configService.get<string>('minioAccessKey');
        const secretAccessKey = this.configService.get<string>('minioSecretKey');
        const bucketName = this.configService.get<string>('minioBucketName');

        if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error('ERROR: Environment variables required for MinIO/S3 configuration are missing');
        }

        this.s3Client = new S3Client({
            endpoint: endpoint,
            region: 'us-east-1',
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
            forcePathStyle: true,
        });

        this.bucketName = bucketName;
    }

    async uploadFile(fileKey: string, buffer: Buffer, mimeType: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: buffer,
                ContentType: mimeType,
            });

            await this.s3Client.send(command);

            return `${this.configService.get<string>('minioEndpoint')}/${this.bucketName}/${fileKey}`;
        } catch (error) {
            throw new InternalServerErrorException('Failed to upload file to Object Storage');
        }
    }

    async downloadFile(fileKey: string): Promise<any> {
        const command = new GetObjectCommand({ Bucket: this.bucketName, Key: fileKey });
        const response = await this.s3Client.send(command);
        return response.Body;
    }
}