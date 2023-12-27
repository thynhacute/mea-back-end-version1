import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export const NKMethodUploadSingleFile = (methods: MethodDecorator) => {
    return applyDecorators(
        methods,
        ApiConsumes('multipart/form-data'),
        UseInterceptors(FileInterceptor('file')),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        }),
    );
};
