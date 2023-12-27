import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, UploadedFile } from '@nestjs/common';
import { FileExtension } from 'file-type';

export const NKUploadedFile = (maxFileSize?: number, fileTypeRegex?: RegExp | string) => {
    const validators = [];
    if (maxFileSize) {
        validators.push(
            new MaxFileSizeValidator({
                maxSize: 1024 * 1024 * maxFileSize,
            }),
        );
    }

    if (fileTypeRegex) {
        validators.push(
            new FileTypeValidator({
                fileType: fileTypeRegex,
            }),
        );
    }

    return UploadedFile(
        new ParseFilePipe({
            validators,
        }),
    );
};
