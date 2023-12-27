import { HttpStatus, Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { Equipment } from './equipment.entity';
import { Brackets, EntityManager, SelectQueryBuilder } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateEquipmentDTO } from './dto/create-equipment.dto';
import { UpdateEquipmentDTO } from './dto/update-equipment.dto';
import { NKTransaction } from '../core/common/NKTransaction';
import { NKGlobal } from '../core/common/NKGlobal';
import { EquipmentStatus, EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { DepartmentService } from '../department/department.service';
import { PagingFilter } from '../core/common/dtos/paging.dto';
import { CompareOperator } from '../core/interface';
import { UpdateEquipmentStatusDTO } from './dto/update-equipment-status.dto';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { BrandService } from '../brand/brand.service';
import { NKResponseException, nkMessage } from '../core/exception';
import { HttpStatusCode } from 'axios';
import { SelectOptionDto } from 'src/core/common/dtos/select-options.dto';
import { EquipmentMaintainScheduleService } from '../equipment-maintain-schedule/equipment-maintain-schedule.service';
import { ChangeDepartmentDto } from './dto/change-department.dto';

@NKService()
export class EquipmentService extends NKServiceBase<Equipment> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly equipmentCategoryService: EquipmentCategoryService,
        private readonly departmentService: DepartmentService,
        private readonly equipmentMaintainScheduleService: EquipmentMaintainScheduleService,
        private readonly equipmentStatusService: EquipmentStatusService,
        private readonly brandService: BrandService,
    ) {
        super(entityManager.getRepository(Equipment));
    }

    async createOne(dto: CreateEquipmentDTO) {
        await this.validateUniqueField('code', dto.code);

        await this.equipmentCategoryService.getOneByField('id', dto.equipmentCategoryId);
        if (dto.brandId) {
            await this.brandService.getOneByField('id', dto.brandId);
        }

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entity) => {
                const equipment = await entity.save(Equipment, {
                    name: dto.name,
                    code: dto.code,
                    description: dto.description,
                    mfDate: dto.mfDate,
                    importDate: dto.importDate,

                    endOfWarrantyDate: dto.endOfWarrantyDate,
                    imageUrls: dto.imageUrls,
                    equipmentCategory: {
                        id: dto.equipmentCategoryId,
                    },
                    brand: {
                        id: dto.brandId,
                    },
                });

                await entity.save(EquipmentStatus, {
                    equipment: {
                        id: equipment.id,
                    },
                    lastStatus: dto.equipmentStatus,
                    currentStatus: dto.equipmentStatus,
                    note: 'tạo mới thiết bị',
                });

                return equipment;
            },
            {},
        );
    }

    async updateOne(id: string, dto: UpdateEquipmentDTO) {
        const equipment = await this.getOneByField('id', id);

        await this.validateUniqueField('code', dto.code, equipment.id);

        await this.brandService.getOneByField('id', dto.brandId);
        await this.equipmentCategoryService.getOneByField('id', dto.equipmentCategoryId);

        return await NKGlobal.entityManager.update(
            Equipment,
            {
                id: id,
            },
            {
                name: dto.name,
                code: dto.code,
                description: dto.description,
                mfDate: dto.mfDate,
                importDate: dto.importDate,

                endOfWarrantyDate: dto.endOfWarrantyDate,
                imageUrls: dto.imageUrls,
                equipmentCategory: {
                    id: dto.equipmentCategoryId,
                },
                brand: {
                    id: dto.brandId,
                },
            },
        );
    }

    async getAllEquipmentWithActiveStatus(departmentId?: string) {
        const res = await this.entityManager.find(Equipment, {
            where: {
                isDeleted: false,
                department: {
                    id: departmentId,
                },
            },
            relations: ['equipmentStatus'],
        });

        return res.filter((e) => {
            const currentStatus = e.equipmentStatus.sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            })[0];

            if (!currentStatus) {
                return false;
            }

            return currentStatus.currentStatus === EquipmentStatusType.ACTIVE;
        });
    }
    async getAllEquipmentWithActive() {
        const res = await this.entityManager.find(Equipment, {
            where: {
                isDeleted: false,
            },
            relations: ['equipmentStatus'],
        });

        return res.filter((e) => {
            const currentStatus = e.equipmentStatus.sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            })[0];

            if (!currentStatus) {
                return false;
            }

            return currentStatus.currentStatus === EquipmentStatusType.ACTIVE;
        });
    }

    async getByDepartmentId(departmentId: string, dto: PagingFilter) {
        const department = await this.departmentService.getOneByField('id', departmentId);

        const res = await this.getPaging({
            filters: [],
            orderBy: [],
            page: 0,
            pageSize: 1000,
        });

        return res.data.filter((e) => {
            return e.department?.id === department.id;
        });
    }

    async updateEquipmentStatus(id: string, dto: UpdateEquipmentStatusDTO) {
        const equipment = await this.getOneByField('id', id);
        const currentStatus = await this.equipmentStatusService.getCurrentStatus(equipment.id);

        if (currentStatus.currentStatus === dto.status) {
            return currentStatus;
        }

        await this.equipmentStatusService.addOne(equipment.id, dto.status, dto.note);
    }

    async getPaging(props: PagingFilter, extraQuery?: (query: SelectQueryBuilder<Equipment>) => void) {
        // const allEquipment = await this.getAllEquipmentWithActive();

        const res = await super.getPaging(props);

        res.data = res.data.map((e) => {
            const currentStatus = e.equipmentStatus.sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            })[0];

            if (!currentStatus) {
                return e;
            }

            return {
                ...e,
                currentStatus: currentStatus.currentStatus,
            };
        });

        return res;
    }

    async getOneByField(field: keyof Equipment, value: any) {
        const equipment = await super.getOneByField(field, value);

        const currentStatus = await this.equipmentStatusService.getCurrentStatus(equipment.id);

        return {
            ...equipment,
            currentStatus: currentStatus.currentStatus,
        };
    }

    async getOneByFieldNotDraft(field: keyof Equipment, value: any) {
        const equipment = await super.getOneByField(field, value);

        const currentStatus = await this.equipmentStatusService.getCurrentStatus(equipment.id);

        if (currentStatus.currentStatus === EquipmentStatusType.DRAFT) {
            throw new NKResponseException(nkMessage.error.equipmentMustNotBeDraft, HttpStatus.BAD_REQUEST, {});
        }

        return {
            ...equipment,
            currentStatus: currentStatus.currentStatus,
        };
    }

    async getSearchPaging(props: PagingFilter, extraQuery?: (query: SelectQueryBuilder<Equipment>) => void) {
        const allEquipment = await this.getAllEquipmentWithActive();

        const search = props.filters.find((e) => e.field === 'search');

        const res = await super.getPaging(
            {
                ...props,
                filters: props.filters.filter((e) => e.field !== 'search'),
            },
            (query) => {
                query.andWhere('entity.id IN (:...ids)', {
                    ids: allEquipment.map((e) => e.id),
                });
                // search like name or code
                query.andWhere(
                    new Brackets((qb) => {
                        qb.where('entity.name LIKE :search', {
                            search: `%${search.value}%`,
                        }).orWhere('entity.code LIKE :search', {
                            search: `%${search.value}%`,
                        });
                    }),
                );
            },
        );

        res.data = res.data.map((e) => {
            const currentStatus = e.equipmentStatus.sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            })[0];

            if (!currentStatus) {
                return e;
            }

            return {
                ...e,
                currentStatus: currentStatus.currentStatus,
            };
        });

        return res;
    }

    async getSelectOption(dto: SelectOptionDto) {
        const res = await super.getSelectOption(dto);

        return res
            .map((e) => {
                const currentStatus = e.equipmentStatus.sort((a, b) => {
                    return b.createdAt.getTime() - a.createdAt.getTime();
                })[0];

                if (!currentStatus) {
                    return e;
                }

                return {
                    ...e,
                    currentStatus: currentStatus.currentStatus,
                };
            })
            .filter((e: any) => {
                return e.currentStatus !== EquipmentStatusType.DRAFT;
            });
    }

    async changeDepartment(equipmentId: string, dto: ChangeDepartmentDto) {
        const equipment = await this.getOneByFieldNotDraft('id', equipmentId);
        const department = await this.departmentService.getOneByField('id', dto.departmentId);

        await this.entityManager.save(EquipmentStatus, {
            equipment: {
                id: equipment.id,
            },
            lastStatus: equipment.currentStatus,
            currentStatus: equipment.currentStatus,
            note: 'Chuyển từ phòng ' + equipment.department.name + ' sang phòng ' + department.name,
        });

        await this.entityManager.update(
            Equipment,
            {
                id: equipment.id,
            },
            {
                department: {
                    id: department.id,
                },
            },
        );
    }
}
