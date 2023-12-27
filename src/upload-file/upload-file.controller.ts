import { HttpStatus, Post } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';

import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { NKMethodUploadSingleFile } from '../core/decorators/NKMethodUpload.decorator';
import { NKUploadedFile } from '../core/decorators/NKUploadFile.decorator';
import { NKResponseException, nkMessage } from '../core/exception';
import { SingleService } from '../single/single.service';
import { UserRoleIndex } from '../user-role/user-role.constant';

@NKAuthController({
    apiName: 'upload-file',
    permission: UserRoleIndex.USER,
})
export class UploadFileController {
    constructor(private readonly uploadFileService: UploadFileService, private readonly singleService: SingleService) {}

    @NKMethodUploadSingleFile(Post('/upload'))
    async uploadAvatar(
        @NKUploadedFile()
        file: Express.Multer.File,
    ) {
        const maxFileSize = await this.singleService.getSingle(UploadFileController.name, 'AWS_MAX_FILE_SIZE', '10');
        const acceptFileExtension = await this.singleService.getSingle(
            UploadFileController.name,
            'AWS_ACCEPT_FILE_EXTENSION',
            '.png,.jpeg,.jpg',
        );

        if (!file) throw new NKResponseException(nkMessage.error.fileRequired, HttpStatus.BAD_REQUEST);
        const isCorrectSize = this.uploadFileService.checkFileSize(file, +maxFileSize.value);
        if (!isCorrectSize)
            throw new NKResponseException(nkMessage.error.fileTooLarge, HttpStatus.BAD_REQUEST, {
                maxFileSize: `${maxFileSize.value}MB`,
            });

        const isCorrectFileExtension = this.uploadFileService.checkFileExtension(
            file,
            acceptFileExtension.value.split(','),
        );
        if (!isCorrectFileExtension)
            throw new NKResponseException(nkMessage.error.fileExtension, HttpStatus.BAD_REQUEST, {
                extension: acceptFileExtension.value,
            });

        const fileLocation = await this.uploadFileService.uploadFile(file, 'user');
        if (!fileLocation)
            throw new NKResponseException(nkMessage.error.internalServerError, HttpStatus.INTERNAL_SERVER_ERROR);

        return {
            fileLocation,
        };
    }
}
