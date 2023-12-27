import { PagingFilter, PagingResult } from '../interface/repositories.interface';
import { Repository, SelectQueryBuilder } from 'typeorm';

export class RepositoryService<T> extends Repository<T> {
    protected defaultQuery(tableName: string) {
        return ` AND ${tableName}.status <> 'inactive'`;
    }

    protected queryWithOptions(tableName: string, field: string, value: string[]) {
        return value.map((item) => ` OR ${tableName}.${field} LIKE '${item}'`).join(' ');
    }

    protected async paging(
        query: SelectQueryBuilder<T>,
        pagingProps: Record<keyof PagingFilter | string, any>,
        isFilterStatus = true,
    ): Promise<PagingResult<T>> {
        const { tableName } = this.metadata;

        if (isFilterStatus) {
            if (!pagingProps.isShowInactive) {
                query = query.andWhere(`${tableName}.status <> 'INACTIVE'`);
            }
        }

        try {
            const data = await query
                .skip(pagingProps.page * pagingProps.pageSize)
                .take(pagingProps.pageSize)
                .orderBy(`${tableName}.${pagingProps.orderBy}`, pagingProps.order)
                .getMany();

            const count = await query.getCount();

            return { data, count };
        } catch (err) {
            console.log(err);
            return { data: [], count: 0 };
        }
    }

    public async findOneByField(field: keyof T, value: any): Promise<T> {
        const results = await this.createQueryBuilder().where(`"${field.toString()}" = :value`, { value }).getOne();
        return results;
    }

    public async findManyByField(field: keyof T, value: any) {
        return await this.createQueryBuilder().where(`"${field.toString()}" = :value`, { value }).getMany();
    }
}
