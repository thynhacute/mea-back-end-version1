import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { UploadFileController } from './upload-file.controller';
import { Credentials, S3, config } from 'aws-sdk';
import { NKConfig } from '../core';
import { SingleModule } from '../single/single.module';

@Module({
    imports: [SingleModule],
    controllers: [UploadFileController],
    providers: [
        UploadFileService,
        {
            provide: S3,
            useFactory: () => {
                const credentials = new Credentials({
                    accessKeyId: NKConfig.AWS_ACCESS_KEY,
                    secretAccessKey: NKConfig.AWS_SECRET_KEY,
                });

                config.update({
                    credentials,
                });

                return new S3();
            },
        },
    ],
})
export class UploadFileModule {}
