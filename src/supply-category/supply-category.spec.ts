import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateSupplyCategoryDto } from './dto/update-supply-category.dto';
import { SupplyCategoryService } from './supply-category.service';
import { SupplyCategory } from './supply-category.entity';

describe('SupplyCategoryController', () => {
    let app: INestApplication;
    let adminToken: string;

    let supplyCategoryService: SupplyCategoryService;

    beforeAll(async () => {
        const { getApp, superAdminToken } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;

        supplyCategoryService = await app.resolve<SupplyCategoryService>(SupplyCategoryService);
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateSupplyCategoryDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/supply-category`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const res = await reqApi({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Fail Duplicate Name', async () => {
            const dto: CreateSupplyCategoryDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            await reqApi(dto);
            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateSupplyCategoryDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/supply-category/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let supplyCategory: SupplyCategory;

        beforeEach(async () => {
            supplyCategory = await supplyCategoryService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
        });

        it('Pass', async () => {
            const res = await reqApi(supplyCategory.id, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail Duplicate Name', async () => {
            const dto: UpdateSupplyCategoryDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            await supplyCategoryService.createOne(dto);
            const res = await reqApi(supplyCategory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
