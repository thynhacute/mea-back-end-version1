import { NKEntityBase } from '../core/common/NKEntityBase';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
export enum UserTokenType {
    AUTH = 'AUTH',
    RESET_PASSWORD = 'RESET_PASSWORD',
}

@Entity()
export class UserToken extends NKEntityBase {
    @Column({ default: '' })
    token: string;

    @Column({ default: '' })
    value: string;

    @Column({ default: UserTokenType.AUTH })
    type: UserTokenType;

    @Column({ default: new Date() })
    expiredAt: Date;

    @ManyToOne(() => User, (user) => user.userTokens, {
        cascade: true,
    })
    user: User;
}
