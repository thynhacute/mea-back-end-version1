import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { Brand, BrandStatus } from '../brand/brand.entity';
import { BrandService } from '../brand/brand.service';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { Equipment } from '../equipment/equipment.entity';
import { EquipmentService } from '../equipment/equipment.service';
import { SupplyCategory } from '../supply-category/supply-category.entity';
import { SupplyCategoryService } from '../supply-category/supply-category.service';
import { User } from '../user/user.entity';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { UpdateSupplyDTO } from './dto/update-supply.dto';
import { Supply, SupplyStatus } from './supply.entity';
import { SupplyService } from './supply.service';

describe('SupplyController', () => {
    let app: INestApplication;
    let adminToken: string;
    let supplyService: SupplyService;
    let adminUser: User;
    let brand: Brand;
    let brandService: BrandService;
    let supplyCategoryService: SupplyCategoryService;
    let supplyCategory: SupplyCategory;
    let equipmentService: EquipmentService;
    let equipmentCategoryService: EquipmentCategoryService;
    let equipmentCategory: EquipmentCategory;
    let equipment: Equipment;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        adminUser = superAdminUser;
        supplyService = await app.resolve<SupplyService>(SupplyService);
        brandService = await app.resolve<BrandService>(BrandService);
        supplyCategoryService = await app.resolve<SupplyCategoryService>(SupplyCategoryService);
        equipmentService = await app.resolve<EquipmentService>(EquipmentService);
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
        equipmentCategory = await equipmentCategoryService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        brand = await brandService.createOne({
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            status: BrandStatus.ACTIVE,
        });

        supplyCategory = await supplyCategoryService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        equipment = (await equipmentService.createOne({
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            brandId: brand.id,
            endOfWarrantyDate: new Date(),
            equipmentCategoryId: equipmentCategory.id,
            equipmentStatus: EquipmentStatusType.ACTIVE,
            imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
            importDate: new Date(),
            mfDate: new Date(),
        })) as Equipment;
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateSupplyDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/supply`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: CreateSupplyDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                equipmentCategoryId: equipmentCategory.id,
            };

            const res = await reqApi(dto);

            const supply = await supplyService.getOneByField('id', res.body.id);

            expect(supply).toBeDefined();
            expect(supply.description).toBe(res.body.description);
            expect(supply.name).toBe(res.body.name);
            expect(supply.code).toBe(res.body.code);
            expect(supply.brand.id).toBe(brand.id);
            expect(supply.supplyCategory.id).toBe(supplyCategory.id);
            expect(supply.status).toBe(res.body.status);
            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it("Fail with code isn't unique", async () => {
            const dto: CreateSupplyDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                equipmentCategoryId: equipmentCategory.id,
            };

            await reqApi(dto);

            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it("Fail with name isn't unique", async () => {
            const dto: CreateSupplyDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                equipmentCategoryId: equipmentCategory.id,
            };

            await reqApi(dto);

            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateSupplyDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/supply/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let supply: Supply;

        beforeEach(async () => {
            supply = await supplyService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                equipmentCategoryId: equipmentCategory.id,
            });
        });

        it('Pass', async () => {
            const dto: UpdateSupplyDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                equipmentCategoryId: equipmentCategory.id,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(supply.id, dto);
            const updatedSupplyRequest = await supplyService.getOneByField('id', supply.id);

            expect(updatedSupplyRequest).toBeDefined();
            expect(updatedSupplyRequest.description).toBe(dto.description);
            expect(updatedSupplyRequest.status).toBe(dto.status);
            expect(updatedSupplyRequest.name).toBe(dto.name);
            expect(updatedSupplyRequest.code).toBe(dto.code);

            expect(res.status).toBe(HttpStatus.OK);
        });

        it("Fail with code isn't unique", async () => {
            const dto: UpdateSupplyDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                equipmentCategoryId: equipmentCategory.id,
            };

            await supplyService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: dto.code,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                equipmentCategoryId: equipmentCategory.id,
            });

            const res = await reqApi(supply.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it("Fail with name isn't unique", async () => {
            const dto: UpdateSupplyDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: SupplyStatus.ACTIVE,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                equipmentCategoryId: equipmentCategory.id,
            };

            await supplyService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: dto.name,
                status: SupplyStatus.ACTIVE,
                brandId: brand.id,
                supplyCategoryId: supplyCategory.id,
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                equipmentCategoryId: equipmentCategory.id,
            });

            const res = await reqApi(supply.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('GET /equipment/:equipmentId', () => {
        const reqApi = (equipmentId: string) =>
            supertest(app.getHttpServer())
                .get(`/api/v1/supply/equipment-category/${equipmentId}`)
                .set({ authorization: 'Bearer ' + adminToken });

        it('Pass', async () => {
            const res = await reqApi(equipmentCategory.id);

            expect(res.body.length).toBeGreaterThan(0);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
