import { NKEntityBase } from '../core/common/NKEntityBase';
import { Column, Entity } from 'typeorm';

@Entity()
export class SenderCapture extends NKEntityBase {
    @Column({ default: '', length: 1024 })
    note: string;

    @Column({ default: '', length: 1024 })
    content: string;

    @Column({ default: '', length: 64 })
    sender: string;

    @Column({ default: '', length: 64 })
    to: string;

    @Column({ default: '', length: 64 })
    type: string;
}
