import { NKEntityBase } from '../core/common/NKEntityBase';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserRoleIndex } from './user-role.constant';
import { User } from '../user/user.entity';

@Entity()
export class UserRole extends NKEntityBase {
    @Column({ default: '', length: 128 })
    name: string;

    @Column({ default: '' })
    description: string;

    @Column({
        default: UserRoleIndex.USER,
        nullable: false,
    })
    index: number;

    @Column({
        default: false,
        nullable: false,
    })
    isAllowedDelete: boolean;

    @Column({
        default: false,
        nullable: false,
    })
    isAllowedEdit: boolean;

    @Column({
        default: true,
        nullable: false,
    })
    isAllowedView: boolean;

    @Column({
        default: false,
        nullable: false,
    })
    isAllowedCreate: boolean;

    @Column({
        default: false,
        nullable: false,
    })
    isApproved: boolean;

    @Column({
        default: '',
        length: 128,
    })
    source: string;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
