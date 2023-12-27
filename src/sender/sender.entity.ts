import { NKEntityBase } from '../core/common/NKEntityBase';
import { Column, Entity } from 'typeorm';

export enum SenderType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    TELEGRAM = 'TELEGRAM',
}

@Entity()
export class Sender extends NKEntityBase {
    @Column({ default: '', length: 128 })
    name: string;

    @Column({ default: '', length: 255 })
    password: string;

    @Column({ default: '', length: 255 })
    token: string;

    @Column({ default: '', length: 64 })
    host: string;

    @Column({ default: '', length: 32 })
    port: string;

    @Column({ default: '', length: 64 })
    from: string;

    @Column({ default: '', length: 64 })
    to: string;

    @Column({ default: '', length: 64 })
    type: SenderType;
}
