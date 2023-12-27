import joi from 'joi';

export class CreateXlsxDto {
    data: {
        [key: string]: any;
    }[];

    static validate = joi.object<CreateXlsxDto>({});
}
