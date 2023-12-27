import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { NKGlobal } from '../core/common/NKGlobal';
import { Department } from '../department/department.entity';
import { DepartmentService } from '../department/department.service';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { EquipmentStatus, EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { Equipment } from '../equipment/equipment.entity';
import { EquipmentService } from '../equipment/equipment.service';
import { ExportInventoryItem } from '../export-inventory-item/export-inventory-item.entity';
import { ImportRequestService } from '../import-request/import-request.service';
import { Supply, SupplyStatus } from '../supply/supply.entity';
import { SupplyService } from '../supply/supply.service';
import { User } from '../user/user.entity';
import { AddExportInventoryItemDTO } from './dto/add-export-inventory-item.dto';
import { CreateExportInventoryDTO } from './dto/create-export-inventory.dto';
import { UpdateExportInventoryItemDTO } from './dto/update-export-inventory-item.dto';
import { UpdateExportInventoryDTO } from './dto/update-export-inventory.dto';
import { UpdateStatusExportInventoryDTO } from './dto/update-status-export-inventory.dto';
import { ExportInventory, ExportInventoryStatus } from './export-inventory.entity';
import { ExportInventoryService } from './export-inventory.service';
import { Brand, BrandStatus } from '../brand/brand.entity';
import { BrandService } from '../brand/brand.service';
import { SupplyCategoryService } from '../supply-category/supply-category.service';
import { SupplyCategory } from '../supply-category/supply-category.entity';

describe('ExportInventoryController', () => {
    let app: INestApplication;
    let adminToken: string;

    let exportInventoryService: ExportInventoryService;

    let equipmentCategoryService: EquipmentCategoryService;
    let equipmentService: EquipmentService;
    let supplyService: SupplyService;
    let adminUser: User;
    let departmentService: DepartmentService;
    let department: Department;
    let importRequestService: ImportRequestService;
    let brand: Brand;
    let brandService: BrandService;
    let supplyCategoryService: SupplyCategoryService;
    let supplyCategory: SupplyCategory;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        adminUser = superAdminUser;

        exportInventoryService = await app.resolve<ExportInventoryService>(ExportInventoryService);
        equipmentService = await app.resolve<EquipmentService>(EquipmentService);
        supplyService = await app.resolve<SupplyService>(SupplyService);
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
        departmentService = await app.resolve<DepartmentService>(DepartmentService);
        importRequestService = await app.resolve<ImportRequestService>(ImportRequestService);
        brandService = await app.resolve<BrandService>(BrandService);
        brand = await brandService.createOne({
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            status: BrandStatus.ACTIVE,
        });
        supplyCategoryService = await app.resolve<SupplyCategoryService>(SupplyCategoryService);
        supplyCategory = await supplyCategoryService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        department = await departmentService.createDepartment({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateExportInventoryDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/export-inventory`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: CreateExportInventoryDTO = {
                departmentId: department.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                exportDate: new Date(),
                importRequestId: null,
            };

            const res = await reqApi(dto);

            const exportInventory = await exportInventoryService.getOneByField('id', res.body.id);

            expect(exportInventory).toBeDefined();
            expect(exportInventory.note).toBe(dto.note);
            expect(exportInventory.updatedBy.id).toBe(adminUser.id);
            expect(exportInventory.createdBy.id).toBe(adminUser.id);
            expect(exportInventory.status).toBe(ExportInventoryStatus.REQUESTING);

            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Pass with importRequestId', async () => {
            const importRequest = await importRequestService.createOne(adminUser, {
                departmentId: department.id,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                importRequestItems: [],
            });

            await importRequestService.submitImportRequest(adminUser, importRequest.id);

            await importRequestService.approveImportRequest(adminUser, importRequest.id, {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            const dto: CreateExportInventoryDTO = {
                departmentId: department.id,
                exportDate: new Date(),
                importRequestId: importRequest.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(dto);

            const exportInventory = await exportInventoryService.getOneByField('id', res.body.id);

            expect(exportInventory).toBeDefined();

            expect(exportInventory.note).toBe(dto.note);
            expect(exportInventory.updatedBy.id).toBe(adminUser.id);
            expect(exportInventory.createdBy.id).toBe(adminUser.id);
            expect(exportInventory.status).toBe(ExportInventoryStatus.REQUESTING);
            expect(exportInventory.importRequest.id).toBe(importRequest.id);

            expect(res.status).toBe(HttpStatus.CREATED);
        });
    });

    describe('POST /:id/item', () => {
        const reqApi = (id: string, dto: AddExportInventoryItemDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/export-inventory/${id}/item`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let exportInventory: ExportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            exportInventory = await exportInventoryService.createOne(adminUser, {
                departmentId: department.id,
                exportDate: new Date(),
                importRequestId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
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
                equipmentStatus: EquipmentStatusType.IDLE,
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
                status: SupplyStatus.ACTIVE,
                brandId: brand.id,
                equipmentCategoryId: null,
                supplyCategoryId: supplyCategory.id,
            });

            supply = await supplyService.getOneByField('id', supply.id);
        });

        it('Pass', async () => {
            const dto: AddExportInventoryItemDTO = {
                equipmentId: equipment.id,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);
            const updatedImportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);

            expect(res.status).toBe(HttpStatus.CREATED);
            expect(updatedImportInventory.exportInventoryItems.length).toBe(1);
            expect(updatedImportInventory.exportInventoryItems[0].equipment.id).toBe(equipment.id);
            expect(updatedImportInventory.exportInventoryItems[0].supply).toBeNull();
            expect(updatedImportInventory.exportInventoryItems[0].quantity).toBe(dto.quantity);
        });

        it('Pass with supplyId', async () => {
            const dto: AddExportInventoryItemDTO = {
                equipmentId: null,
                quantity: 10,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);
            const updatedImportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);

            expect(res.status).toBe(HttpStatus.CREATED);
            expect(updatedImportInventory.exportInventoryItems.length).toBe(1);
            expect(updatedImportInventory.exportInventoryItems[0].supply.id).toBe(supply.id);
            expect(updatedImportInventory.exportInventoryItems[0].equipment).toBeNull();
            expect(updatedImportInventory.exportInventoryItems[0].quantity).toBe(dto.quantity);
        });

        it('Fail supplyId and equipmentId is null', async () => {
            const dto: AddExportInventoryItemDTO = {
                equipmentId: null,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail supplyId and equipmentId is not null', async () => {
            const dto: AddExportInventoryItemDTO = {
                equipmentId: equipment.id,
                quantity: 1,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail equipmentId is not idle status', async () => {
            await NKGlobal.entityManager.update(
                EquipmentStatus,
                { equipment: { id: equipment.id } },
                { currentStatus: EquipmentStatusType.ACTIVE },
            );

            const dto: AddExportInventoryItemDTO = {
                equipmentId: equipment.id,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail have more than 1 equipment', async () => {
            const dto: AddExportInventoryItemDTO = {
                equipmentId: equipment.id,

                quantity: 2,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string, dto: UpdateExportInventoryItemDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/export-inventory/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let exportInventory: ExportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            exportInventory = await exportInventoryService.createOne(adminUser, {
                departmentId: department.id,
                exportDate: new Date(),
                importRequestId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
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
                equipmentStatus: EquipmentStatusType.IDLE,
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

            await exportInventoryService.addExportInventoryItem(adminUser, exportInventory.id, {
                equipmentId: null,
                quantity: 1,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            await exportInventoryService.addExportInventoryItem(adminUser, exportInventory.id, {
                equipmentId: equipment.id,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            exportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);
        });

        it('Pass update supply for supply', async () => {
            const dto: UpdateExportInventoryItemDTO = {
                quantity: 2,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const supplyId = exportInventory.exportInventoryItems.find((item) => item.supply)?.id;

            const res = await reqApi(exportInventory.id, supplyId, dto);

            const updatedImportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportInventory.exportInventoryItems.find((item) => item.supply)?.quantity).toBe(
                dto.quantity,
            );
        });

        it('Fail cannot update quantity  for equipment', async () => {
            const dto: UpdateExportInventoryItemDTO = {
                quantity: 2,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const equipmentId = exportInventory.exportInventoryItems.find((item) => item.equipment)?.id;

            const res = await reqApi(exportInventory.id, equipmentId, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id/cancel', () => {
        const reqApi = (id: string, dto: UpdateStatusExportInventoryDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/export-inventory/${id}/cancel`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let exportInventory: ExportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            exportInventory = await exportInventoryService.createOne(adminUser, {
                departmentId: department.id,
                exportDate: new Date(),
                importRequestId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
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
                equipmentStatus: EquipmentStatusType.IDLE,
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

            await exportInventoryService.addExportInventoryItem(adminUser, exportInventory.id, {
                equipmentId: null,
                quantity: 1,
                supplyId: supply.id,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            await exportInventoryService.addExportInventoryItem(adminUser, exportInventory.id, {
                equipmentId: equipment.id,
                quantity: 1,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                supplyId: null,
            });

            exportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);
        });

        it('Pass', async () => {
            const dto = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);
            const updatedExportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);

            expect(updatedExportInventory.note).toBe(dto.note);
            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedExportInventory.status).toBe(ExportInventoryStatus.CANCELLED);
        });
    });

    describe('PUT /:id/approve', () => {
        const reqApi = (id: string, dto: UpdateStatusExportInventoryDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/export-inventory/${id}/approve`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let exportInventory: ExportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            exportInventory = await exportInventoryService.createOne(adminUser, {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                exportDate: new Date(),
                importRequestId: null,
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
                equipmentStatus: EquipmentStatusType.IDLE,
                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase'), fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
                brandId: brand.id,
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

            await exportInventoryService.addExportInventoryItem(adminUser, exportInventory.id, {
                equipmentId: null,
                quantity: 1,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                supplyId: supply.id,
            });

            await exportInventoryService.addExportInventoryItem(adminUser, exportInventory.id, {
                equipmentId: equipment.id,

                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            exportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);
        });

        it('Pass', async () => {
            const dto = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(exportInventory.id, dto);

            const updatedExportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedExportInventory.status).toBe(ExportInventoryStatus.APPROVED);
            //check status of equipment
            const updatedEquipment = await equipmentService.getOneByField('id', equipment.id);

            const lastEquipmentStatus = updatedEquipment.equipmentStatus.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            )[0];
            expect(lastEquipmentStatus.currentStatus).toBe(EquipmentStatusType.ACTIVE);

            //check quantity of supply
            const updatedSupply = await supplyService.getOneByField('id', supply.id);

            expect(updatedSupply.quantity).toBe(supply.quantity - 1);
        });

        it('Fail item is empty', async () => {
            const dto = {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };
            await NKGlobal.entityManager.delete(ExportInventoryItem, {
                exportInventory: { id: exportInventory.id },
            });

            const res = await reqApi(exportInventory.id, dto);
            const updatedExportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
            expect(updatedExportInventory.status).toBe(ExportInventoryStatus.REQUESTING);
        });
    });

    describe('DELETE /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string) =>
            supertest(app.getHttpServer())
                .delete(`/api/v1/export-inventory/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let exportInventory: ExportInventory;
        let equipmentCategory: EquipmentCategory;
        let equipment: Equipment;
        let supply: Supply;

        beforeEach(async () => {
            exportInventory = await exportInventoryService.createOne(adminUser, {
                departmentId: department.id,
                exportDate: new Date(),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                importRequestId: null,
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
                equipmentStatus: EquipmentStatusType.IDLE,
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

            await exportInventoryService.addExportInventoryItem(adminUser, exportInventory.id, {
                equipmentId: equipment.id,
                quantity: 1,
                supplyId: null,
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            exportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);
        });

        it('Pass', async () => {
            const res = await reqApi(exportInventory.id, exportInventory.exportInventoryItems[0].id);
            const updatedExportInventory = await exportInventoryService.getOneByField('id', exportInventory.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedExportInventory.exportInventoryItems.length).toBe(0);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateExportInventoryDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/export-inventory/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importInventory: ExportInventory;

        beforeEach(async () => {
            importInventory = await exportInventoryService.createOne(adminUser, {
                exportDate: new Date(),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestId: null,
            });
        });

        it('Pass', async () => {
            const dto: UpdateExportInventoryDTO = {
                exportDate: new Date(),
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestId: null,
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedRepairRequest = await exportInventoryService.getOneByField('id', importInventory.id);

            expect(updatedRepairRequest).toBeDefined();

            expect(updatedRepairRequest.note).toBe(dto.note);
            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.status).toBe(ExportInventoryStatus.REQUESTING);
            expect(res.status).toBe(HttpStatus.OK);
        });
        it('Pass with import request', async () => {
            const importRequest = await importRequestService.createOne(adminUser, {
                departmentId: department.id,
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                importRequestItems: [],
            });

            await importRequestService.submitImportRequest(adminUser, importRequest.id);

            await importRequestService.approveImportRequest(adminUser, importRequest.id, {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            const dto: UpdateExportInventoryDTO = {
                exportDate: new Date(),
                departmentId: department.id,
                importRequestId: importRequest.id,

                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importInventory.id, dto);
            const updatedRepairRequest = await exportInventoryService.getOneByField('id', importInventory.id);

            expect(updatedRepairRequest).toBeDefined();

            expect(updatedRepairRequest.note).toBe(dto.note);
            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.status).toBe(ExportInventoryStatus.REQUESTING);
            expect(updatedRepairRequest.importRequest.id).toBe(importRequest.id);
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail status is not draft', async () => {
            const dto: UpdateExportInventoryDTO = {
                exportDate: new Date(),
                departmentId: department.id,
                importRequestId: null,

                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            };
            await NKGlobal.entityManager.update(
                ExportInventory,
                { id: importInventory.id },
                { status: ExportInventoryStatus.APPROVED },
            );
            const res = await reqApi(importInventory.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
