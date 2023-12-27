import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { ImportPlanItemService } from '../import-plan-item/import-plan-item.service';
import { User } from '../user/user.entity';
import { AddImportPlanItemDTO } from './dto/add-import-plan-item.dto';
import { CreateImportPlanDTO } from './dto/create-import-plan.dto';
import { UpdateImportPlanItemDTO } from './dto/update-import-plan-item.dto';
import { ImportPlan, ImportPlanStatus } from './import-plan.entity';
import { ImportPlanService } from './import-plan.service';
import { NKGlobal } from '../core/common/NKGlobal';
import { ImportPlanItem } from '../import-plan-item/import-plan-item.entity';
import { UpdateImportPlanDTO } from './dto/update-import-plan.dto';

describe('ImportPlanController', () => {
    let app: INestApplication;
    let adminToken: string;

    let importPlanService: ImportPlanService;
    let importPlanItemService: ImportPlanItemService;

    let adminUser: User;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        adminUser = superAdminUser;

        importPlanService = await app.resolve<ImportPlanService>(ImportPlanService);
        importPlanItemService = await app.resolve<ImportPlanItemService>(ImportPlanItemService);
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateImportPlanDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/import-plan`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: CreateImportPlanDTO = {
                endImportDate: new Date(),
                startImportDate: new Date(),
            };

            const res = await reqApi(dto);

            const importPlan = await importPlanService.getOneByField('id', res.body.id);

            expect(importPlan).toBeDefined();
            expect(importPlan.updatedBy.id).toBe(adminUser.id);
            expect(importPlan.createdBy.id).toBe(adminUser.id);
            expect(importPlan.status).toBe(ImportPlanStatus.DRAFT);
            expect(res.status).toBe(HttpStatus.CREATED);
        });
    });

    describe('POST /:id/item', () => {
        const reqApi = (id: string, dto: AddImportPlanItemDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/import-plan/${id}/item`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importPlan: ImportPlan;

        beforeEach(async () => {
            importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });
        });

        it('Pass', async () => {
            const dto: AddImportPlanItemDTO = {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const res = await reqApi(importPlan.id, dto);
            const updatedImportPlan = await importPlanService.getOneByField('id', importPlan.id);

            expect(updatedImportPlan.code).toBe(importPlan.code);
            expect(updatedImportPlan.contractSymbol).toBe(importPlan.contractSymbol);
            expect(updatedImportPlan.documentNumber).toBe(importPlan.documentNumber);
            expect(updatedImportPlan.updatedBy.id).toBe(adminUser.id);
            expect(updatedImportPlan.createdBy.id).toBe(adminUser.id);
            expect(updatedImportPlan.status).toBe(ImportPlanStatus.DRAFT);

            expect(res.status).toBe(HttpStatus.CREATED);
        });
    });

    describe('PUT /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string, dto: UpdateImportPlanItemDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-plan/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importPlan: ImportPlan;

        beforeEach(async () => {
            importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });

            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importPlan = await importPlanService.getOneByField('id', importPlan.id);
        });

        it('Pass update item', async () => {
            const dto: UpdateImportPlanItemDTO = {
                price: 1000,
                quantity: 2,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            const importPlanItem = importPlan.importPlanItems[0];

            const res = await reqApi(importPlan.id, importPlanItem.id, dto);

            const updatedImportPlan = await importPlanItemService.getOneByField('id', importPlanItem.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportPlan.quantity).toBe(dto.quantity);
            expect(updatedImportPlan.price).toBe(dto.price);
            expect(updatedImportPlan.name).toBe(dto.name);
        });
    });

    describe('PUT /:id/cancel', () => {
        const reqApi = (id: string) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-plan/${id}/cancel`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let importPlan: ImportPlan;

        beforeEach(async () => {
            importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });

            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importPlan = await importPlanService.getOneByField('id', importPlan.id);
        });

        it('Pass', async () => {
            const res = await reqApi(importPlan.id);
            const updatedImportPlan = await importPlanService.getOneByField('id', importPlan.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportPlan.status).toBe(ImportPlanStatus.CANCELLED);
        });
    });

    describe('PUT /:id/approve', () => {
        const reqApi = (id: string) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-plan/${id}/approve`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let importPlan: ImportPlan;

        beforeEach(async () => {
            importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });

            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importPlan = await importPlanService.getOneByField('id', importPlan.id);
        });

        it('Pass', async () => {
            await importPlanService.submitImportPlan(adminUser, importPlan.id);

            const res = await reqApi(importPlan.id);
            const updatedImportPlan = await importPlanService.getOneByField('id', importPlan.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportPlan.status).toBe(ImportPlanStatus.APPROVED);
        });

        it('Fail plan is not submitted', async () => {
            const res = await reqApi(importPlan.id);
            const updatedImportPlan = await importPlanService.getOneByField('id', importPlan.id);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
            expect(updatedImportPlan.status).toBe(ImportPlanStatus.DRAFT);
        });
    });

    describe('PUT /:id/submit', () => {
        const reqApi = (id: string) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-plan/${id}/submit`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let importPlan: ImportPlan;

        beforeEach(async () => {
            importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });

            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importPlan = await importPlanService.getOneByField('id', importPlan.id);
        });

        it('Pass', async () => {
            const res = await reqApi(importPlan.id);
            const updatedImportPlan = await importPlanService.getOneByField('id', importPlan.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportPlan.status).toBe(ImportPlanStatus.SUBMITTED);
        });

        it('Fail item is empty', async () => {
            await NKGlobal.entityManager.delete(ImportPlanItem, {
                importPlan: { id: importPlan.id },
            });

            const res = await reqApi(importPlan.id);
            const updatedImportPlan = await importPlanService.getOneByField('id', importPlan.id);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
            expect(updatedImportPlan.status).toBe(ImportPlanStatus.DRAFT);
        });
    });

    describe('DELETE /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string) =>
            supertest(app.getHttpServer())
                .delete(`/api/v1/import-plan/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let importPlan: ImportPlan;

        beforeEach(async () => {
            importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });

            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            await importPlanService.addImportPlanItem(adminUser, importPlan.id, {
                price: 1000,
                quantity: 1,
                category: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                contact: fakeData(10, 'lettersAndNumbersLowerCase'),
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                machine: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                brand: fakeData(10, 'lettersAndNumbersLowerCase'),
                unit: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            importPlan = await importPlanService.getOneByField('id', importPlan.id);
        });

        it('Pass', async () => {
            const res = await reqApi(importPlan.id, importPlan.importPlanItems[0].id);
            const updatedImportPlan = await importPlanService.getOneByField('id', importPlan.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportPlan.importPlanItems.length).toBe(1);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateImportPlanDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-plan/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importPlan: ImportPlan;

        beforeEach(async () => {
            importPlan = await importPlanService.createOne(adminUser, {
                endImportDate: new Date(),
                startImportDate: new Date(),
            });
        });

        it('Pass', async () => {
            const dto: UpdateImportPlanDTO = {
                endImportDate: new Date(),
                startImportDate: new Date(),
            };

            const res = await reqApi(importPlan.id, dto);
            const updatedRepairRequest = await importPlanService.getOneByField('id', importPlan.id);

            expect(updatedRepairRequest).toBeDefined();

            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.status).toBe(ImportPlanStatus.DRAFT);
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail status is not draft', async () => {
            const dto: UpdateImportPlanDTO = {
                endImportDate: new Date(),
                startImportDate: new Date(),
            };
            await NKGlobal.entityManager.update(
                ImportPlan,
                { id: importPlan.id },
                { status: ImportPlanStatus.APPROVED },
            );
            const res = await reqApi(importPlan.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
