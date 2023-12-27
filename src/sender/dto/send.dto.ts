import { ApiProperty } from '@nestjs/swagger';

import { SenderType } from '../sender.entity';

export class SendDto {
    @ApiProperty({ description: 'Message' })
    message: string;

    @ApiProperty({ description: 'Sender type' })
    type: SenderType;

    @ApiProperty({ description: 'Receiver' })
    receiver: string;

    @ApiProperty({ description: 'Extra data' })
    extraData?: any;
}
