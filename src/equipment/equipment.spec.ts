import { HttpStatus, INestApplication } from '@nestjs/common';
import { initTestModule } from '../core/test/initTest';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDTO } from './dto/create-equipment.dto';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { UpdateEquipmentDTO } from './dto/update-equipment.dto';
import { Equipment } from './equipment.entity';
import { DepartmentService } from '../department/department.service';
import { Department } from '../department/department.entity';
import { UpdateEquipmentStatusDTO } from './dto/update-equipment-status.dto';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { BrandService } from '../brand/brand.service';
import { Brand, BrandStatus } from '../brand/brand.entity';

describe('EquipmentController', () => {
    let app: INestApplication;
    let adminToken: string;
    let equipmentService: EquipmentService;
    let equipmentCategoryService: EquipmentCategoryService;
    let equipmentCategory: EquipmentCategory;
    let departmentService: DepartmentService;
    let department: Department;
    let equipmentStatusService: EquipmentStatusService;
    let brandService: BrandService;
    let brand: Brand;

    beforeAll(async () => {
        const { getApp, superAdminToken } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        equipmentService = await app.resolve<EquipmentService>(EquipmentService);
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
        departmentService = await app.resolve<DepartmentService>(DepartmentService);
        equipmentStatusService = await app.resolve<EquipmentStatusService>(EquipmentStatusService);

        brandService = await app.resolve<BrandService>(BrandService);

        equipmentCategory = await equipmentCategoryService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        department = await departmentService.createDepartment({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        brand = await brandService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            status: BrandStatus.ACTIVE,
        });
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateEquipmentDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/equipment`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const res = await reqApi({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,
                equipmentStatus: EquipmentStatusType.ACTIVE,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            });

            const equipment = await equipmentService.getOneByField('id', res.body.id);

            expect(equipment).toBeDefined();
            expect(equipment.equipmentStatus.length).toBe(1);
            expect(equipment.equipmentCategory.id).toBe(equipmentCategory.id);

            expect(equipment.name).toBe(res.body.name);
            expect(equipment.code).toBe(res.body.code);
            expect(equipment.description).toBe(res.body.description);

            expect(equipment.brand.id).toBe(brand.id);

            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Fail Duplicate Code', async () => {
            const dto: CreateEquipmentDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,
                equipmentStatus: EquipmentStatusType.ACTIVE,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
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
        const reqApi = (id: string, dto: UpdateEquipmentDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/equipment/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipment: Equipment;

        beforeEach(async () => {
            equipment = (await equipmentService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
                equipmentStatus: EquipmentStatusType.ACTIVE,
            })) as Equipment;
        });

        it('Pass', async () => {
            const dto: UpdateEquipmentDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            };

            const res = await reqApi(equipment.id, dto);

            const updateEquipment = await equipmentService.getOneByField('id', equipment.id);

            expect(updateEquipment).toBeDefined();
            expect(updateEquipment.equipmentStatus.length).toBe(1);
            expect(updateEquipment.equipmentCategory.id).toBe(equipmentCategory.id);
            expect(equipment.brand.id).toBe(brand.id);
            expect(updateEquipment.code).toBe(dto.code);
            expect(updateEquipment.name).toBe(dto.name);
            expect(updateEquipment.description).toBe(dto.description);

            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail Duplicate Code', async () => {
            const dto: UpdateEquipmentDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            };

            await equipmentService.createOne({
                ...dto,
                equipmentStatus: EquipmentStatusType.ACTIVE,
            });
            const res = await reqApi(equipment.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('GET /status/:id', () => {
        const reqApi = (id: string) =>
            supertest(app.getHttpServer())
                .get(`/api/v1/equipment/status/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let equipment: Equipment;

        beforeEach(async () => {
            equipment = (await equipmentService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
                equipmentStatus: EquipmentStatusType.ACTIVE,
            })) as Equipment;
        });

        it('Pass', async () => {
            const res = await reqApi(equipment.id);

            expect(res.body.currentStatus).toBe(EquipmentStatusType.ACTIVE);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    describe('PUT /status/:id', () => {
        const reqApi = (id: string, dto: UpdateEquipmentStatusDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/equipment/status/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipment: Equipment;

        beforeEach(async () => {
            equipment = (await equipmentService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
                equipmentStatus: EquipmentStatusType.ACTIVE,
            })) as Equipment;
        });

        it('Pass', async () => {
            const dto: UpdateEquipmentStatusDTO = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: EquipmentStatusType.FIXING,
            };

            const res = await reqApi(equipment.id, dto);

            const updateEquipment = await equipmentService.getOneByField('id', equipment.id);
            const currentStatus = await equipmentStatusService.getCurrentStatus(updateEquipment.id);

            expect(updateEquipment).toBeDefined();
            expect(updateEquipment.equipmentStatus.length).toBe(2);
            expect(currentStatus.currentStatus).toBe(dto.status);
            expect(currentStatus.note).toBe(dto.note);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
