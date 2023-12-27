import { Injectable } from '@nestjs/common';
import { NKService } from '../core/decorators/NKService.decorator';
import { S3 } from 'aws-sdk';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NKConfig } from '../core';

@NKService()
export class UploadFileService {
    constructor(private readonly s3: S3) {}

    checkFileExtension(file: Express.Multer.File, extend: Array<string>) {
        const acceptTypes = [...extend];
        const fileType = path.extname(file.originalname).toLocaleLowerCase();

        return acceptTypes.includes(fileType);
    }

    checkFileSize(file: Express.Multer.File, limit: number) {
        const limitSize = limit * 1024 * 1024;
        return file.size < limitSize;
    }

    async uploadFile(file: Express.Multer.File, prefix: 'user' | 'system') {
        const fileType = path.extname(file.originalname).toLocaleLowerCase();
        const id = uuidv4();

        const locationFile = `${prefix}/${id}-${file.filename}${fileType}`;

        return await this.s3
            .putObject({
                Bucket: NKConfig.AWS_S3_BUCKET_NAME,
                Body: file.buffer,
                Key: locationFile,
                ContentType: file.mimetype,
            })
            .promise()
            .then(() => {
                return NKConfig.AWS_PREFIX + '/' + locationFile;
            })
            .catch((error) => {
                console.log(error);
                return null;
            });
    }
}
