import { ApiProperty } from '@nestjs/swagger';

export class NoticeBoardDto {
    @ApiProperty({ description: 'Message' })
    message: string;
}
