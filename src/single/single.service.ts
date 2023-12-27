import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { EntityManager } from 'typeorm';
import { Single } from './single.entity';

@Injectable()
export class SingleService extends NKServiceBase<Single> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(Single));
    }

    async getSingle(scope: string, name: string, defaultValue: string): Promise<Single> {
        let single = await this.entityManager
            .createQueryBuilder(Single, 'single')
            .where('single.scope = :scope', { scope })
            .andWhere('single.name = :name', { name })
            .getOne();
        if (!single) {
            single = await this.entityManager.save(Single, {
                scope,
                name,
                value: defaultValue,
            });
        }

        return single;
    }
}
