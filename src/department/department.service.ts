import { HttpStatus, Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { Department } from './department.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { NKResponseException, nkMessage } from '../core/exception';

@NKService()
export class DepartmentService extends NKServiceBase<Department> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(Department));
    }

    async createDepartment(dto: CreateDepartmentDto) {
        const isExistName = await this.getOneByField('name', dto.name, false);
        if (isExistName) {
            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST);
        }

        return this.entityManager.save(Department, {
            name: dto.name,
            description: dto.description,
        });
    }

    async updateDepartment(id: string, dto: UpdateDepartmentDto) {
        const department = await this.getOneByField('id', id);

        const isExistName = await this.getOneByField('name', dto.name, false);
        if (isExistName && isExistName.id !== department.id) {
            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST);
        }

        return this.entityManager.update(
            Department,
            {
                id: department.id,
            },
            {
                name: dto.name,
                description: dto.description,
                status: Boolean(dto.status) ? dto.status : department.status,
            },
        );
    }
}
