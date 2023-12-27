import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';
import { RepairRequest, RepairRequestStatus } from './repair-request.entity';
import { RepairRequestService } from './repair-request.service';
import { User } from '../user/user.entity';
import { Equipment } from '../equipment/equipment.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { EquipmentService } from '../equipment/equipment.service';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { UpdateStatusRepairRequestDTO } from './dto/update-status-repair-request.dto';
import { Brand, BrandStatus } from '../brand/brand.entity';
import { BrandService } from '../brand/brand.service';

describe('RepairRequestController', () => {
    let app: INestApplication;
    let adminToken: string;
    let repairRequestService: RepairRequestService;
    let equipmentCategoryService: EquipmentCategoryService;
    let equipmentService: EquipmentService;
    let adminUser: User;
    let equipment: Equipment;
    let equipmentCategory: EquipmentCategory;
    let equipmentStatusService: EquipmentStatusService;
    let brand: Brand;
    let brandService: BrandService;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        adminUser = superAdminUser;
        repairRequestService = await app.resolve<RepairRequestService>(RepairRequestService);
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
        equipmentService = await app.resolve<EquipmentService>(EquipmentService);
        equipmentStatusService = await app.resolve<EquipmentStatusService>(EquipmentStatusService);

        brandService = await app.resolve<BrandService>(BrandService);
        brand = await brandService.createOne({
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            status: BrandStatus.ACTIVE,
        });
    });

    beforeEach(async () => {
        equipmentCategory = await equipmentCategoryService.createOne({
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        equipment = (await equipmentService.createOne({
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            equipmentCategoryId: equipmentCategory.id,
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            endOfWarrantyDate: new Date(),
            equipmentStatus: EquipmentStatusType.ACTIVE,
            brandId: brand.id,
            imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
            importDate: new Date(),
            mfDate: new Date(),
        })) as Equipment;
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateRepairRequestDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/repair-request`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: CreateRepairRequestDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipment.id,
            };

            const res = await reqApi(dto);

            const repairRequest = await repairRequestService.getOneByField('id', res.body.id);

            expect(repairRequest).toBeDefined();
            expect(repairRequest.description).toBe(res.body.description);
            expect(repairRequest.updatedBy.id).toBe(adminUser.id);
            expect(repairRequest.createdBy.id).toBe(adminUser.id);
            expect(repairRequest.equipment.id).toBe(equipment.id);

            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Fail Equipment is draft', async () => {
            const dto: CreateRepairRequestDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipment.id,
            };

            await equipmentStatusService.addOne(equipment.id, EquipmentStatusType.DRAFT, 'test');
            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateRepairRequestDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/repair-request/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let repairRequest: RepairRequest;

        beforeEach(async () => {
            repairRequest = await repairRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipment.id,
            });
        });

        it('Pass', async () => {
            const dto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                status: RepairRequestStatus.APPROVED,
                equipmentId: equipment.id,
            };

            const res = await reqApi(repairRequest.id, dto);
            const updatedRepairRequest = await repairRequestService.getOneByField('id', repairRequest.id);

            expect(updatedRepairRequest).toBeDefined();
            expect(updatedRepairRequest.description).toBe(dto.description);
            expect(updatedRepairRequest.status).toBe(dto.status);
            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(repairRequest.equipment.id).toBe(equipment.id);
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail Equipment is draft', async () => {
            const dto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                status: RepairRequestStatus.APPROVED,
                equipmentId: equipment.id,
            };

            await equipmentStatusService.addOne(equipment.id, EquipmentStatusType.DRAFT, 'test');
            const res = await reqApi(repairRequest.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id/cancel', () => {
        const reqApi = (id: string, dto: UpdateStatusRepairRequestDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/repair-request/${id}/cancel`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let repairRequest: RepairRequest;

        beforeEach(async () => {
            repairRequest = await repairRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipment.id,
            });
        });

        it('Pass', async () => {
            const dto: UpdateStatusRepairRequestDTO = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(repairRequest.id, dto);
            const updatedRepairRequest = await repairRequestService.getOneByField('id', repairRequest.id);

            expect(updatedRepairRequest).toBeDefined();
            expect(updatedRepairRequest.status).toBe(RepairRequestStatus.REJECTED);
            expect(updatedRepairRequest.note).toBe(dto.note);
            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(repairRequest.equipment.id).toBe(equipment.id);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    describe('PUT /:id/approve', () => {
        const reqApi = (id: string, dto: UpdateStatusRepairRequestDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/repair-request/${id}/approve`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let repairRequest: RepairRequest;

        beforeEach(async () => {
            repairRequest = await repairRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipment.id,
            });
        });

        it('Pass', async () => {
            const dto: UpdateStatusRepairRequestDTO = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(repairRequest.id, dto);
            const updatedRepairRequest = await repairRequestService.getOneByField('id', repairRequest.id);

            expect(updatedRepairRequest).toBeDefined();
            expect(updatedRepairRequest.status).toBe(RepairRequestStatus.APPROVED);
            expect(updatedRepairRequest.note).toBe(dto.note);
            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(repairRequest.equipment.id).toBe(equipment.id);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
