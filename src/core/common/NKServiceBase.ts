import { HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import _get from 'lodash/get';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NKEntityOption } from '../decorators/NKEntity';
import { NKCurdControllerOption } from '../decorators/interfaces/controller.interface';
import { NKResponseException, nkMessage } from '../exception';
import { CompareOperator } from '../interface';
import { NKEntityBase } from './NKEntityBase';
import { NKGlobal } from './NKGlobal';
import { NKKey } from './NKKey';
import { GenerateReportDto } from './dtos/generate-report.dto';
import { PagingFilter } from './dtos/paging.dto';
import { SelectOptionDto } from './dtos/select-options.dto';
import { EquipmentCategory } from '../../equipment-category/equipment-category.entity';

export class NKServiceBase<T extends NKEntityBase> {
    private repository: Repository<T>;
    apiOptions: NKCurdControllerOption;
    constructor(repository: Repository<T>) {
        this.repository = repository;

        const target = repository.metadata.name as string;

        //restore option from global in case of missing
        if (NKGlobal.serviceOptions[target] && !this.apiOptions) {
            this.apiOptions = NKGlobal.serviceOptions[target];
        }
    }

    async getOneByField(field: keyof T | string, value: any, isThrowException = true): Promise<T> {
        let query = this.repository.createQueryBuilder('entity');

        if (this.apiOptions?.query?.relations) {
            this.apiOptions?.query?.relations.forEach((relation) => {
                const nestedRelationDeep = relation.split('.').length;
                const relationName = relation.split('.').join('-');
                let propertyPath = `entity.${relation}`;
                if (nestedRelationDeep > 1) {
                    const relationNames = relation.split('.');
                    if (relationNames.length > 2) {
                        const lastRelationName = relationNames.pop();
                        const lastRelation = relationNames.join('-');
                        propertyPath = `${lastRelation}.${lastRelationName}`;
                    } else {
                        propertyPath = relation;
                    }
                }

                query.leftJoinAndSelect(propertyPath, relationName);
            });
        }

        query = query.where(`entity.${field as string} = :value`, { value });

        if (!this.apiOptions?.query?.isShowDelete) {
            query.andWhere({
                isDeleted: false,
            });
        }
        const result = await query.getOne();

        if (!result && isThrowException) {
            const reflector = new Reflector();
            const options = reflector.get(
                NKKey.REFLECT_ENTITY,
                this.repository.metadata.target as any,
            ) as NKEntityOption;
            const displayName = _get(options, 'displayName') || this.repository.metadata.name;

            throw new NKResponseException(nkMessage.error.notFound, HttpStatus.NOT_FOUND, {
                entity: displayName,
            });
        }

        return result;
    }

    async getManyByField(field: keyof T | string, value: any[]): Promise<T[]> {
        if (value.length === 0) {
            return [];
        }
        const query = this.repository.createQueryBuilder('entity');

        if (!this.apiOptions?.query?.isShowDelete) {
            query.andWhere({
                isDeleted: false,
            });
        }

        if (this.apiOptions?.query?.relations) {
            this.apiOptions?.query?.relations.forEach((relation) => {
                const nestedRelationDeep = relation.split('.').length;
                const relationName = relation.split('.').join('-');
                let propertyPath = `entity.${relation}`;
                if (nestedRelationDeep > 1) {
                    const relationNames = relation.split('.');
                    if (relationNames.length > 2) {
                        const lastRelationName = relationNames.pop();
                        const lastRelation = relationNames.join('-');
                        propertyPath = `${lastRelation}.${lastRelationName}`;
                    } else {
                        propertyPath = relation;
                    }
                }

                query.leftJoinAndSelect(propertyPath, relationName);
            });
        }

        return await query.where(`entity.${field as string} IN (:...value)`, { value }).getMany();
    }

    async getAll(): Promise<T[]> {
        const query = this.repository.createQueryBuilder('entity');

        if (!this.apiOptions?.query?.isShowDelete) {
            query.andWhere({
                isDeleted: false,
            });
        }

        if (this.apiOptions?.query?.relations) {
            this.apiOptions?.query?.relations.forEach((relation) => {
                const nestedRelationDeep = relation.split('.').length;
                const relationName = relation.split('.').join('-');
                let propertyPath = `entity.${relation}`;
                if (nestedRelationDeep > 1) {
                    const relationNames = relation.split('.');
                    if (relationNames.length > 2) {
                        const lastRelationName = relationNames.pop();
                        const lastRelation = relationNames.join('-');
                        propertyPath = `${lastRelation}.${lastRelationName}`;
                    } else {
                        propertyPath = relation;
                    }
                }

                query.leftJoinAndSelect(propertyPath, relationName);
            });
        }

        return await query.getMany();
    }

    async getPaging(props: PagingFilter, extraQuery?: (query: SelectQueryBuilder<T>) => void) {
        const query = this.repository.createQueryBuilder('entity');

        const filterQuery = await query;
        if (props.filters.length > 0) {
            filterQuery.where(
                props.filters
                    .map((filter) => {
                        if (filter.comparator === CompareOperator.LIKE.toString()) {
                            return `LOWER(entity.${filter.field}) LIKE :${filter.field}`;
                        }
                        if (filter.comparator === CompareOperator.IN.toString()) {
                            return `entity.${filter.field} IN (:...${filter.field})`;
                        }
                        return `entity.${filter.field} ${filter.comparator} :${filter.field}`;
                    })
                    .join(' AND '),
                props.filters.reduce((acc, filter) => {
                    if (filter.comparator === CompareOperator.LIKE.toString()) {
                        acc[filter.field] = filter.value.toLowerCase();
                        return acc;
                    }

                    if (filter.comparator === CompareOperator.IN.toString()) {
                        acc[filter.field] = filter.value.split(',');
                        return acc;
                    }
                    acc[filter.field] = filter.value;
                    return acc;
                }, {}),
            );
        }

        if (!this.apiOptions?.query?.isShowDelete) {
            filterQuery.andWhere({
                isDeleted: false,
            });
        }

        if (extraQuery) {
            extraQuery(filterQuery);
        }

        const count = await query.getCount();

        if (this.apiOptions?.query?.relations) {
            this.apiOptions?.query?.relations.forEach((relation) => {
                const nestedRelationDeep = relation.split('.').length;
                const relationName = relation.split('.').join('-');
                let propertyPath = `entity.${relation}`;
                if (nestedRelationDeep > 1) {
                    const relationNames = relation.split('.');
                    if (relationNames.length > 2) {
                        const lastRelationName = relationNames.pop();
                        const lastRelation = relationNames.join('-');
                        propertyPath = `${lastRelation}.${lastRelationName}`;
                    } else {
                        propertyPath = relation;
                    }
                }

                query.leftJoinAndSelect(propertyPath, relationName);
            });
        }

        if (props.orderBy.length > 0) {
            props.orderBy.forEach((order) => {
                const nestedRelationDeep = order.field.split('.').length;
                const propertyPath = nestedRelationDeep > 1 ? order.field : `entity.${order.field}`;
                filterQuery.addOrderBy(propertyPath, order.order as any);
            });
        }

        filterQuery.skip(props.page * props.pageSize).take(props.pageSize);

        const data = await filterQuery.getMany();

        return {
            count,
            data,
            totalPage: Math.ceil(count / props.pageSize),
        };
    }

    async deleteOne(id: string) {
        if (!this.apiOptions.isAllowDelete) {
            throw new NKResponseException(nkMessage.error.permissionDenied, HttpStatus.FORBIDDEN);
        }

        const entity = await this.getOneByField('id', id);
        entity.isDeleted = true;
        return await this.repository.save(entity as any);
    }

    async getReport(props: GenerateReportDto) {
        const query = this.repository.createQueryBuilder('entity');

        const filterQuery = await query;
        if (props.filters.length > 0) {
            filterQuery.where(
                props.filters
                    .map((filter) => {
                        if (filter.comparator === CompareOperator.LIKE.toString()) {
                            return `LOWER(entity.${filter.field}) LIKE :${filter.field}`;
                        }
                        return `entity.${filter.field} ${filter.comparator} :${filter.field}`;
                    })
                    .join(' AND '),
                props.filters.reduce((acc, filter) => {
                    if (filter.comparator === CompareOperator.LIKE.toString()) {
                        acc[filter.field] = filter.value.toLowerCase();
                        return acc;
                    }
                    acc[filter.field] = filter.value;
                    return acc;
                }, {}),
            );
        }

        if (!this.apiOptions?.query?.isShowDelete) {
            filterQuery.andWhere({
                isDeleted: false,
            });
        }

        if (this.apiOptions?.query?.relations) {
            this.apiOptions?.query?.relations.forEach((relation) => {
                const nestedRelationDeep = relation.split('.').length;
                const relationName = relation.split('.').join('-');
                let propertyPath = `entity.${relation}`;
                if (nestedRelationDeep > 1) {
                    const relationNames = relation.split('.');
                    if (relationNames.length > 2) {
                        const lastRelationName = relationNames.pop();
                        const lastRelation = relationNames.join('-');
                        propertyPath = `${lastRelation}.${lastRelationName}`;
                    } else {
                        propertyPath = relation;
                    }
                }

                query.leftJoinAndSelect(propertyPath, relationName);
            });
        }

        const data = await filterQuery.getMany();

        return data
            .map((item) => {
                const value = props.valuePath ? _get(item, props.valuePath) : item;

                return {
                    value,
                    time: item.createdAt,
                };
            })
            .sort((a, b) => {
                const aTime = new Date(a.time).getTime();
                const bTime = new Date(b.time).getTime();
                return aTime - bTime;
            });
    }

    async getSelectOption(dto: SelectOptionDto) {
        let query = this.repository.createQueryBuilder('entity');
        if (this.apiOptions?.query?.relations) {
            this.apiOptions?.query?.relations.forEach((relation) => {
                const nestedRelationDeep = relation.split('.').length;
                const relationName = relation.split('.').join('-');
                let propertyPath = `entity.${relation}`;
                if (nestedRelationDeep > 1) {
                    const relationNames = relation.split('.');
                    if (relationNames.length > 2) {
                        const lastRelationName = relationNames.pop();
                        const lastRelation = relationNames.join('-');
                        propertyPath = `${lastRelation}.${lastRelationName}`;
                    } else {
                        propertyPath = relation;
                    }
                }

                query.leftJoinAndSelect(propertyPath, relationName);
            });
        }

        if (this.apiOptions.selectOptionField && dto.search) {
            const relation = this.apiOptions.selectOptionField.split('.');

            const entity =
                relation.length > 1 ? this.apiOptions.selectOptionField : `entity.${this.apiOptions.selectOptionField}`;

            query = query.where(`LOWER(${entity}) LIKE LOWER(:value)`, {
                value: `%${dto.search}%`,
            });
        } else {
            query = query;
        }

        if (!this.apiOptions?.query?.isShowDelete) {
            query.andWhere({
                isDeleted: false,
            });
        }

        const data = await query.getMany();

        return data;
    }
    getDecorators(target: any, propertyName: string | symbol): string[] {
        // get info about keys that used in current property
        const keys: any[] = Reflect.getMetadataKeys(target, propertyName);

        const decorators = keys
            // filter your custom decorators
            .filter((key) => key.toString().startsWith('REFLECT_COLUMN'))
            .reduce((values, key) => {
                // get metadata value.
                const currValues = Reflect.getMetadata(key, target, propertyName);
                return values.concat(currValues);
            }, []);

        return decorators;
    }

    async validateUniqueField(field: keyof T | string, value: any, id?: string) {
        const query = this.repository.createQueryBuilder('entity');

        query.where(`entity.${field as string} = :value`, { value }).getOne();
        if (!this.apiOptions?.query?.isShowDelete) {
            query.andWhere({
                isDeleted: false,
            });
        }
        if (id) {
            query.andWhere('entity.id != :id', { id });
        }
        const result = await query.getOne();
        if (result) {
            const reflector = new Reflector();
            const options = reflector.get(
                `${NKKey.REFLECT_COLUMN}:${field.toString()}`,
                (this.repository.metadata.target as Function).prototype,
            );

            const displayName = _get(options, 'displayName') || field.toString();

            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST, {
                field: displayName,
            });
        }

        return true;
    }
}
