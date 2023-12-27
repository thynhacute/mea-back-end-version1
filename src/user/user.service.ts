import { InjectEntityManager } from '@nestjs/typeorm';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { EntityManager } from 'typeorm';
import { User } from './user.entity';

@NKService()
export class UserService extends NKServiceBase<User> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(User));
    }

    async updateOne(user: User): Promise<User> {
        if (user.name) {
            user.name = user.name.trim();
        }
        if (user.email) {
            user.email = user.email.trim();
        }
        if (user.phone) {
            user.phone = user.phone.trim();
        }
        if (user.address) {
            user.address = user.address.trim();
        }

        if (user.status) {
            user.status = user.status;
        }

        return await NKGlobal.entityManager.save(User, user);
    }

    async findOne(field: keyof User, value: any): Promise<User> {
        return await NKGlobal.entityManager.findOne(User, {
            where: {
                [field]: value,
            },
        });
    }
}
