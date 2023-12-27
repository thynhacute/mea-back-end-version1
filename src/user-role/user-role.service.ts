import { Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { UserRole } from './user-role.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NKService } from '../core/decorators/NKService.decorator';
import { UserRoleIndex } from './user-role.constant';

@NKService()
export class UserRoleService extends NKServiceBase<UserRole> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(UserRole));
    }

    isCheckHigherRoleThanTarget(currentRole: UserRole, targetRole: UserRole) {
        if (currentRole.index === UserRoleIndex.ADMIN) {
            return true;
        }

        if (!currentRole || !targetRole) {
            return false;
        }

        return currentRole.index < targetRole.index;
    }
}
