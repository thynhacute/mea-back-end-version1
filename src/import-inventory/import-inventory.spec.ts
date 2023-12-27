import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { User } from '../user/user.entity';
import { CreateImportInventoryDTO } from './dto/create-import-inventory.dto';
import { UpdateImportInventoryDTO } from './dto/update-import-inventory.dto';
import { ImportInventory, ImportInventoryStatus } from './import-inventory.entity';
import { ImportInventoryService } from './import-inventory.service';
import { NKGlobal } from '../core/common/NKGlobal';
import { AddImportInventoryItemDTO } from './dto/add-import-inventory-item.dto';
import { EquipmentService } from '../equipment/equipment.service';
import { SupplyService } from '../supply/supply.service';
import { Equipment } from '../equipment/equipment.entity';
import { Supply, SupplyStatus } from '../supply/supply.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentStatus, EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { UpdateImportInventoryItemDTO } from './dto/update-import-inventory-item.dto';
import { ImportInventoryItem } from '../import-inventory-item/import-inventory-item.entity';
import { ImportPlanService } from '../import-plan/import-plan.service';
import { UpdateStatusImportInventoryDTO } from './dto/update-status-import-inventory.dto';
import { Brand, BrandStatus } from '../brand/brand.entity';
import { BrandService } from '../brand/brand.service';
import { SupplyCategoryService } from '../supply-category/supply-category.service';
import { SupplyCategory } from '../supply-category/supply-category.entity';

describe('ImportInventoryController', () => {
    let app: INestApplication;
    let adminToken: string;

    let importInventoryService: ImportInventoryService;
    let importPlanService: ImportPlanService;
    let equipmentCategoryService: EquipmentCategoryService;
    let equipmentService: EquipmentService;
    let supplyService: SupplyService;
    let adminUser: User;
    let brand: Brand;
    let brandService: BrandService;
    let supplyCategoryService: SupplyCategoryService;
    let supplyCategory: SupplyCategory;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        adminUser = superAdminUser;

        importInventoryService = await app.resolve<ImportInventoryService>(ImportInventoryService);
        equipmentService = await app.resolve<EquipmentService>(EquipmentService);
        supplyService = await app.resolve<SupplyService>(SupplyService);
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
        importPlanService = await app.resolve<ImportPlanService>(ImportPlanService);
        brandService = await app.resolve<BrandService>(BrandService);
        supplyCategoryService = await app.resolve<SupplyCategoryService>(SupplyCategoryService);
        supplyCategory = await supplyCategoryService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        brand = await brandService.createOne({
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            status: BrandStatus.ACTIVE,
        });
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateImportInventoryDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/import-inventory`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: CreateImportInventoryDTO = {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                importPlanId: null,
            };

            const res = await reqApi(dto);

            const importInventory = await importInventoryService.getOneByField('id', res.body.id);

            expect(importInventory).toBeDefined();
            expect(importInventory.name).toBe(dto.name);
            expect(importInventory.note).toBe(dto.note);
            expect(importInventory.updatedBy.id).toBe(adminUser.id);
            expect(importInventory.createdBy.id).toBe(adminUser.id);
            expect(importInventory.status).toBe(ImportInventoryStatus.REQUESTING);

            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Pass with planId', async () => {
            const importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });

            const dto: CreateImportInventoryDTO = {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: importPlan.id,
            };

            const res = await reqApi(dto);

            const importInventory = await importInventoryService.getOneByField('id', res.body.id);

            expect(importInventory).toBeDefined();
            expect(importInventory.name).toBe(dto.name);
            expect(importInventory.note).toBe(dto.note);
            expect(importInventory.updatedBy.id).toBe(adminUser.id);
            expect(importInventory.createdBy.id).toBe(adminUser.id);
            expect(importInventory.status).toBe(ImportInventoryStatus.REQUESTING);
            expect(importInventory.importPlan.id).toBe(importPlan.id);

            expect(res.status).toBe(HttpStatus.CREATED);
        });
    });

    describe('POST /:id/item', () => {
        const reqApi = (id: string, dto: AddImportInventoryItemDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/import-inventory/${id}/item`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importInventory: ImportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            importInventory = await importInventoryService.createOne(adminUser, {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            });

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
                equipmentStatus: EquipmentStatusType.DRAFT,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            })) as Equipment;

            equipment = await equipmentService.getOneByField('id', equipment.id);

            supply = await supplyService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                status: SupplyStatus.INACTIVE,
                brandId: brand.id,
                equipmentCategoryId: null,
                supplyCategoryId: supplyCategory.id,
            });

            supply = await supplyService.getOneByField('id', supply.id);
        });

        it('Pass', async () => {
            const dto: AddImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedImportInventory = await importInventoryService.getOneByField('id', importInventory.id);

            expect(res.status).toBe(HttpStatus.CREATED);
            expect(updatedImportInventory.importInventoryItems.length).toBe(1);
            expect(updatedImportInventory.importInventoryItems[0].equipment.id).toBe(equipment.id);
            expect(updatedImportInventory.importInventoryItems[0].supply).toBeNull();
            expect(updatedImportInventory.importInventoryItems[0].quantity).toBe(dto.quantity);
        });

        it('Pass with supplyId', async () => {
            const dto: AddImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                equipmentId: null,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 10,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedImportInventory = await importInventoryService.getOneByField('id', importInventory.id);

            expect(res.status).toBe(HttpStatus.CREATED);
            expect(updatedImportInventory.importInventoryItems.length).toBe(1);
            expect(updatedImportInventory.importInventoryItems[0].equipment).toBeNull();
            expect(updatedImportInventory.importInventoryItems[0].supply.id).toBe(supply.id);
            expect(updatedImportInventory.importInventoryItems[0].quantity).toBe(dto.quantity);
        });

        it('Fail supplyId and equipmentId is null', async () => {
            const dto: AddImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                equipmentId: null,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail supplyId and equipmentId is not null', async () => {
            const dto: AddImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail equipmentId is not draft status', async () => {
            await NKGlobal.entityManager.update(
                EquipmentStatus,
                { equipment: { id: equipment.id } },
                { currentStatus: EquipmentStatusType.ACTIVE },
            );

            const dto: AddImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail have more than 1 equipment', async () => {
            const dto: AddImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 2,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string, dto: UpdateImportInventoryItemDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-inventory/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importInventory: ImportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            importInventory = await importInventoryService.createOne(adminUser, {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            });

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
                equipmentStatus: EquipmentStatusType.DRAFT,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            })) as Equipment;

            equipment = await equipmentService.getOneByField('id', equipment.id);

            supply = await supplyService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                status: SupplyStatus.INACTIVE,
                brandId: brand.id,
                equipmentCategoryId: null,
                supplyCategoryId: supplyCategory.id,
            });

            supply = await supplyService.getOneByField('id', supply.id);

            await importInventoryService.addImportInventoryItem(adminUser, importInventory.id, {
                endOfWarrantyDate: new Date(),
                equipmentId: null,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            await importInventoryService.addImportInventoryItem(adminUser, importInventory.id, {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importInventory = await importInventoryService.getOneByField('id', importInventory.id);
        });

        it('Pass update supply for supply', async () => {
            const dto: UpdateImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 2,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const supplyId = importInventory.importInventoryItems.find((item) => item.supply)?.id;

            const res = await reqApi(importInventory.id, supplyId, dto);

            const updatedImportInventory = await importInventoryService.getOneByField('id', importInventory.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportInventory.importInventoryItems.find((item) => item.supply)?.quantity).toBe(
                dto.quantity,
            );
        });

        it('Fail cannot update quantity  for equipment', async () => {
            const dto: UpdateImportInventoryItemDTO = {
                endOfWarrantyDate: new Date(),
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 2,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const equipmentId = importInventory.importInventoryItems.find((item) => item.equipment)?.id;

            const res = await reqApi(importInventory.id, equipmentId, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id/cancel', () => {
        const reqApi = (id: string, dto: UpdateStatusImportInventoryDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-inventory/${id}/cancel`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importInventory: ImportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            importInventory = await importInventoryService.createOne(adminUser, {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            });

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
                equipmentStatus: EquipmentStatusType.DRAFT,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            })) as Equipment;

            equipment = await equipmentService.getOneByField('id', equipment.id);

            supply = await supplyService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                status: SupplyStatus.INACTIVE,
                brandId: brand.id,
                equipmentCategoryId: null,
                supplyCategoryId: supplyCategory.id,
            });

            supply = await supplyService.getOneByField('id', supply.id);

            await importInventoryService.addImportInventoryItem(adminUser, importInventory.id, {
                endOfWarrantyDate: new Date(),
                equipmentId: null,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            await importInventoryService.addImportInventoryItem(adminUser, importInventory.id, {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                supplyId: null,
            });

            importInventory = await importInventoryService.getOneByField('id', importInventory.id);
        });

        it('Pass', async () => {
            const dto = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedImportInventory = await importInventoryService.getOneByField('id', importInventory.id);

            expect(updatedImportInventory.note).toBe(dto.note);
            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportInventory.status).toBe(ImportInventoryStatus.CANCELLED);
        });
    });

    describe('PUT /:id/approve', () => {
        const reqApi = (id: string, dto: UpdateStatusImportInventoryDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-inventory/${id}/approve`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importInventory: ImportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            importInventory = await importInventoryService.createOne(adminUser, {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            });

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
                equipmentStatus: EquipmentStatusType.DRAFT,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            })) as Equipment;

            equipment = await equipmentService.getOneByField('id', equipment.id);

            supply = await supplyService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                status: SupplyStatus.INACTIVE,
                brandId: brand.id,
                equipmentCategoryId: null,
                supplyCategoryId: supplyCategory.id,
            });

            supply = await supplyService.getOneByField('id', supply.id);

            await importInventoryService.addImportInventoryItem(adminUser, importInventory.id, {
                endOfWarrantyDate: new Date(),
                equipmentId: null,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                supplyId: supply.id,
            });

            await importInventoryService.addImportInventoryItem(adminUser, importInventory.id, {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importInventory = await importInventoryService.getOneByField('id', importInventory.id);
        });

        it('Pass', async () => {
            const dto = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedImportInventory = await importInventoryService.getOneByField('id', importInventory.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportInventory.status).toBe(ImportInventoryStatus.APPROVED);
            //check status of equipment
            const updatedEquipment = await equipmentService.getOneByField('id', equipment.id);

            const lastEquipmentStatus = updatedEquipment.equipmentStatus.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            )[0];
            expect(lastEquipmentStatus.currentStatus).toBe(EquipmentStatusType.IDLE);

            //check quantity of supply
            const updatedSupply = await supplyService.getOneByField('id', supply.id);

            expect(updatedSupply.quantity).toBe(supply.quantity + 1);
        });

        it('Fail item is empty', async () => {
            const dto = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };
            await NKGlobal.entityManager.delete(ImportInventoryItem, {
                importInventory: { id: importInventory.id },
            });

            const res = await reqApi(importInventory.id, dto);
            const updatedImportInventory = await importInventoryService.getOneByField('id', importInventory.id);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
            expect(updatedImportInventory.status).toBe(ImportInventoryStatus.REQUESTING);
        });
    });

    describe('DELETE /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string) =>
            supertest(app.getHttpServer())
                .delete(`/api/v1/import-inventory/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let importInventory: ImportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            importInventory = await importInventoryService.createOne(adminUser, {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            });

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
                equipmentStatus: EquipmentStatusType.DRAFT,
                brandId: brand.id,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
            })) as Equipment;

            equipment = await equipmentService.getOneByField('id', equipment.id);

            supply = await supplyService.createOne({
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                status: SupplyStatus.INACTIVE,
                brandId: brand.id,
                equipmentCategoryId: null,
                supplyCategoryId: supplyCategory.id,
            });

            supply = await supplyService.getOneByField('id', supply.id);

            await importInventoryService.addImportInventoryItem(adminUser, importInventory.id, {
                endOfWarrantyDate: new Date(),
                equipmentId: equipment.id,
                expiredDate: new Date(),
                mfDate: new Date(),
                price: 1000,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importInventory = await importInventoryService.getOneByField('id', importInventory.id);
        });

        it('Pass', async () => {
            const res = await reqApi(importInventory.id, importInventory.importInventoryItems[0].id);
            const updatedImportInventory = await importInventoryService.getOneByField('id', importInventory.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportInventory.importInventoryItems.length).toBe(0);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateImportInventoryDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-inventory/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importInventory: ImportInventory;

        beforeEach(async () => {
            importInventory = await importInventoryService.createOne(adminUser, {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            });
        });

        it('Pass', async () => {
            const dto: UpdateImportInventoryDTO = {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedRepairRequest = await importInventoryService.getOneByField('id', importInventory.id);

            expect(updatedRepairRequest).toBeDefined();
            expect(updatedRepairRequest.name).toBe(dto.name);
            expect(updatedRepairRequest.note).toBe(dto.note);
            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.status).toBe(ImportInventoryStatus.REQUESTING);
            expect(res.status).toBe(HttpStatus.OK);
        });
        it('Pass with import plan', async () => {
            const importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });

            const dto: UpdateImportInventoryDTO = {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: importPlan.id,
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedRepairRequest = await importInventoryService.getOneByField('id', importInventory.id);

            expect(updatedRepairRequest).toBeDefined();
            expect(updatedRepairRequest.name).toBe(dto.name);
            expect(updatedRepairRequest.note).toBe(dto.note);
            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.status).toBe(ImportInventoryStatus.REQUESTING);
            expect(updatedRepairRequest.importPlan.id).toBe(importPlan.id);
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail status is not draft', async () => {
            const dto: UpdateImportInventoryDTO = {
                importDate: new Date(),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),

                importPlanId: null,
            };
            await NKGlobal.entityManager.update(
                ImportInventory,
                { id: importInventory.id },
                { status: ImportInventoryStatus.APPROVED },
            );
            const res = await reqApi(importInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
