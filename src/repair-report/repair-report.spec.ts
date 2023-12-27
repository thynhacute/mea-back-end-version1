import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { Equipment } from '../equipment/equipment.entity';
import { EquipmentService } from '../equipment/equipment.service';
import { User } from '../user/user.entity';
import { CreateRepairReportDto } from './dto/create-repair-report.dto';
import { RepairReport, RepairReportStatus } from './repair-report.entity';
import { RepairReportService } from './repair-report.service';
import { UpdateRepairReportDto } from './dto/update-repair-report.dto';
import { AddRepairReportItemDto } from './dto/add-repair-report-item.dto';
import { UpdateRepairReportItemDto } from './dto/update-repair-report-item.dto';
import {
    RepairReportItem,
    RepairReportItemStatus,
    RepairReportItemType,
} from '../repair-report-item/repair-report-item.entity';
import { SupplyService } from '../supply/supply.service';
import { Supply, SupplyStatus } from '../supply/supply.entity';
import { Brand, BrandStatus } from '../brand/brand.entity';
import { BrandService } from '../brand/brand.service';
import { SupplyCategoryService } from '../supply-category/supply-category.service';
import { SupplyCategory } from '../supply-category/supply-category.entity';

describe('RepairReportController', () => {
    let app: INestApplication;
    let adminToken: string;
    let adminUser: User;
    let equipmentCategoryService: EquipmentCategoryService;
    let equipmentService: EquipmentService;
    let supplyService: SupplyService;
    let supply: Supply;
    let repairReportService: RepairReportService;
    let brand: Brand;
    let brandService: BrandService;
    let supplyCategoryService: SupplyCategoryService;
    let supplyCategory: SupplyCategory;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser } = await initTestModule();
        app = getApp;
        adminUser = superAdminUser;

        adminToken = superAdminToken.token;
        equipmentService = await app.resolve<EquipmentService>(EquipmentService);
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
        supplyService = await app.resolve<SupplyService>(SupplyService);

        repairReportService = await app.resolve<RepairReportService>(RepairReportService);
        brandService = await app.resolve<BrandService>(BrandService);
        supplyCategoryService = await app.resolve<SupplyCategoryService>(SupplyCategoryService);
        supplyCategory = await supplyCategoryService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        brand = await brandService.createOne({
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            status: BrandStatus.ACTIVE,
        });
    });

    beforeEach(async () => {
        supply = await supplyService.createOne({
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
            status: SupplyStatus.ACTIVE,
            brandId: brand.id,
            equipmentCategoryId: null,
            supplyCategoryId: supplyCategory.id,
        });
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateRepairReportDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/repair-report`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipmentCategory: EquipmentCategory;
        let equipmentOne: Equipment;
        let equipmentTwo: Equipment;

        beforeEach(async () => {
            equipmentCategory = await equipmentCategoryService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            equipmentOne = (await equipmentService.createOne({
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

            equipmentOne = await equipmentService.getOneByField('id', equipmentOne.id);

            equipmentTwo = (await equipmentService.createOne({
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

            equipmentTwo = await equipmentService.getOneByField('id', equipmentTwo.id);
        });

        it('Pass', async () => {
            const now = new Date();
            const after = new Date();
            after.setHours(after.getHours() + 1);
            const dto: CreateRepairReportDto = {
                startAt: now,
                endAt: after,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                repairReportItems: [],
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(dto);

            const repairReport = await repairReportService.getOneByField('id', res.body.id);

            expect(repairReport.status).toBe(RepairReportStatus.FIXING);
            expect(repairReport.createdBy.id).toBe(adminUser.id);

            expect(repairReport.updatedBy.id).toBe(adminUser.id);
            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Fail some equipment is draft', async () => {
            const equipmentThree = (await equipmentService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                equipmentCategoryId: equipmentCategory.id,
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentStatus: EquipmentStatusType.DRAFT,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            })) as Equipment;

            const now = new Date();
            const after = new Date();
            after.setHours(after.getHours() + 1);
            const dto: CreateRepairReportDto = {
                startAt: now,
                endAt: after,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                repairReportItems: [
                    {
                        equipmentId: equipmentThree.id,
                        name: fakeData(10, 'lettersAndNumbersLowerCase'),
                        description: fakeData(10, 'lettersAndNumbersLowerCase'),
                        imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                        replaceItems: [],
                        type: RepairReportItemType.FIXING,
                    },
                ],
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateRepairReportDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/repair-report/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipmentCategory: EquipmentCategory;
        let equipmentOne: Equipment;
        let equipmentTwo: Equipment;
        let repairReport: RepairReport;

        beforeEach(async () => {
            equipmentCategory = await equipmentCategoryService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            equipmentOne = (await equipmentService.createOne({
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

            equipmentOne = await equipmentService.getOneByField('id', equipmentOne.id);

            equipmentTwo = (await equipmentService.createOne({
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

            equipmentTwo = await equipmentService.getOneByField('id', equipmentTwo.id);
            const now = new Date();
            const after = new Date();
            after.setHours(after.getHours() + 1);
            repairReport = (await repairReportService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                startAt: now,
                endAt: after,

                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                repairReportItems: [],
            })) as RepairReport;
        });

        it('Pass', async () => {
            const dto: UpdateRepairReportDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                startAt: repairReport.startAt,
                endAt: repairReport.endAt,
                status: RepairReportStatus.COMPLETED,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(repairReport.id, dto);

            const repairReportUpdate = await repairReportService.getOneByField('id', res.body.id);

            expect(repairReport.createdBy.id).toBe(adminUser.id);
            expect(repairReport.updatedBy.id).toBe(adminUser.id);

            expect(repairReportUpdate.status).toBe(RepairReportStatus.COMPLETED);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    describe('POST /:id/item', () => {
        const reqApi = (id: string, dto: AddRepairReportItemDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/repair-report/${id}/item`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipmentCategory: EquipmentCategory;
        let equipmentOne: Equipment;
        let equipmentTwo: Equipment;
        let repairReport: RepairReport;

        beforeEach(async () => {
            equipmentCategory = await equipmentCategoryService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            equipmentOne = (await equipmentService.createOne({
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

            equipmentOne = await equipmentService.getOneByField('id', equipmentOne.id);

            equipmentTwo = (await equipmentService.createOne({
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

            equipmentTwo = await equipmentService.getOneByField('id', equipmentTwo.id);
            const now = new Date();
            const after = new Date();
            after.setHours(after.getHours() + 1);
            repairReport = (await repairReportService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                startAt: now,
                endAt: after,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                repairReportItems: [],
            })) as RepairReport;
        });

        it('Pass', async () => {
            const dto: AddRepairReportItemDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipmentOne.id,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                replaceItems: [
                    {
                        supplyId: supply.id,
                        quantity: 1,
                    },
                ],
                type: RepairReportItemType.FIXING,
            };

            const res = await reqApi(repairReport.id, dto);

            const repairReportUpdate = await repairReportService.getOneByField('id', repairReport.id);

            expect(repairReportUpdate.repairReportItems.length).toBe(1);
            expect(repairReportUpdate.repairReportItems[0].description).toBe(dto.description);
            expect(repairReportUpdate.repairReportItems[0].imageUrls).toEqual(dto.imageUrls);
            expect(repairReportUpdate.repairReportItems[0].createdBy.id).toEqual(adminUser.id);
            expect(repairReportUpdate.repairReportItems[0].updatedBy.id).toEqual(adminUser.id);
            expect(repairReportUpdate.createdBy.id).toBe(adminUser.id);
            expect(repairReportUpdate.updatedBy.id).toBe(adminUser.id);
            expect(repairReportUpdate.status).toBe(RepairReportStatus.FIXING);
            expect(res.status).toBe(HttpStatus.CREATED);
        });
    });

    //update repair report item
    describe('PUT /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string, dto: UpdateRepairReportItemDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/repair-report/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipmentCategory: EquipmentCategory;
        let equipmentOne: Equipment;
        let equipmentTwo: Equipment;
        let repairReport: RepairReport;
        let repairReportItem: RepairReportItem;

        beforeEach(async () => {
            equipmentCategory = await equipmentCategoryService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            equipmentOne = (await equipmentService.createOne({
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

            equipmentOne = await equipmentService.getOneByField('id', equipmentOne.id);

            equipmentTwo = (await equipmentService.createOne({
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

            equipmentTwo = await equipmentService.getOneByField('id', equipmentTwo.id);
            const now = new Date();
            const after = new Date();
            after.setHours(after.getHours() + 1);
            repairReport = (await repairReportService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                startAt: now,
                endAt: after,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                repairReportItems: [],
            })) as RepairReport;

            repairReportItem = await repairReportService.addRepairReportItem(repairReport.id, adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipmentOne.id,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                replaceItems: [
                    {
                        supplyId: supply.id,
                        quantity: 1,
                    },
                ],
                type: RepairReportItemType.FIXING,
            });
        });

        it('Pass', async () => {
            const dto: UpdateRepairReportItemDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                replaceItems: [],
                status: RepairReportItemStatus.COMPLETED,
                type: RepairReportItemType.FIXING,
            };

            const res = await reqApi(repairReport.id, repairReportItem.id, dto);

            const repairReportUpdate = await repairReportService.getOneByField('id', repairReport.id);

            expect(repairReportUpdate.repairReportItems.length).toBe(1);
            expect(repairReportUpdate.repairReportItems[0].description).toBe(dto.description);
            expect(repairReportUpdate.repairReportItems[0].imageUrls).toEqual(dto.imageUrls);
            expect(repairReportUpdate.repairReportItems[0].createdBy.id).toEqual(adminUser.id);
            expect(repairReportUpdate.repairReportItems[0].updatedBy.id).toEqual(adminUser.id);
            expect(repairReportUpdate.createdBy.id).toBe(adminUser.id);
            expect(repairReportUpdate.updatedBy.id).toBe(adminUser.id);
            expect(repairReportUpdate.status).toBe(RepairReportStatus.FIXING);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    //delete repair report item
    describe('DELETE /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string) =>
            supertest(app.getHttpServer())
                .delete(`/api/v1/repair-report/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken });

        let equipmentCategory: EquipmentCategory;
        let equipmentOne: Equipment;
        let equipmentTwo: Equipment;
        let repairReport: RepairReport;
        let repairReportItem: RepairReportItem;

        beforeEach(async () => {
            equipmentCategory = await equipmentCategoryService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            equipmentOne = (await equipmentService.createOne({
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

            equipmentOne = await equipmentService.getOneByField('id', equipmentOne.id);

            equipmentTwo = (await equipmentService.createOne({
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

            equipmentTwo = await equipmentService.getOneByField('id', equipmentTwo.id);
            const now = new Date();
            const after = new Date();
            after.setHours(after.getHours() + 1);
            repairReport = (await repairReportService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                startAt: now,
                endAt: after,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                repairReportItems: [],
            })) as RepairReport;

            repairReportItem = await repairReportService.addRepairReportItem(repairReport.id, adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                equipmentId: equipmentOne.id,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                replaceItems: [
                    {
                        supplyId: supply.id,
                        quantity: 1,
                    },
                ],
                type: RepairReportItemType.FIXING,
            });

            repairReport = await repairReportService.getOneByField('id', repairReport.id);
        });

        it('Pass', async () => {
            const res = await reqApi(repairReport.id, repairReportItem.id);

            const repairReportUpdate = await repairReportService.getOneByField('id', repairReport.id);

            expect(repairReportUpdate.repairReportItems.length).toBe(0);
            expect(repairReportUpdate.createdBy.id).toBe(adminUser.id);
            expect(repairReportUpdate.updatedBy.id).toBe(adminUser.id);
            expect(repairReportUpdate.status).toBe(RepairReportStatus.FIXING);
            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
