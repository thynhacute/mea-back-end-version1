import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { EquipmentCategoryService } from './equipment-category.service';
import { EquipmentCategory } from './equipment-category.entity';
import { CreateEquipmentCategoryDto } from './dto/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from './dto/update-equipment-category.dto';

describe('EquipmentCategoryController', () => {
    let app: INestApplication;
    let adminToken: string;
    let equipmentCategoryService: EquipmentCategoryService;

    beforeAll(async () => {
        const { getApp, superAdminToken } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateEquipmentCategoryDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/equipment-category`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const res = await reqApi({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Fail Duplicate Name', async () => {
            const dto: CreateEquipmentCategoryDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            await reqApi(dto);
            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail Duplicate Code', async () => {
            const dto: CreateEquipmentCategoryDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            await reqApi(dto);
            const res = await reqApi({
                ...dto,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateEquipmentCategoryDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/equipment-category/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipmentCategory: EquipmentCategory;

        beforeEach(async () => {
            equipmentCategory = await equipmentCategoryService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
        });

        it('Pass', async () => {
            const res = await reqApi(equipmentCategory.id, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail Duplicate Name', async () => {
            const dto: UpdateEquipmentCategoryDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            await equipmentCategoryService.createOne(dto);
            const res = await reqApi(equipmentCategory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail Duplicate Code', async () => {
            const dto: UpdateEquipmentCategoryDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            await equipmentCategoryService.createOne(dto);
            const res = await reqApi(equipmentCategory.id, {
                ...dto,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
