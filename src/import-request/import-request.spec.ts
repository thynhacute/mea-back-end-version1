import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { NKGlobal } from '../core/common/NKGlobal';
import { ImportRequestItem } from '../import-request-item/import-request-item.entity';
import { ImportRequestItemService } from '../import-request-item/import-request-item.service';
import { User } from '../user/user.entity';
import { AddImportRequestItemDTO } from './dto/add-import-request-item.dto';
import { CreateImportRequestDTO } from './dto/create-import-request.dto';
import { UpdateImportRequestItemDTO } from './dto/update-import-request-item.dto';
import { UpdateImportRequestDTO } from './dto/update-import-request.dto';
import { ImportRequest, ImportRequestStatus } from './import-request.entity';
import { ImportRequestService } from './import-request.service';
import { DepartmentService } from '../department/department.service';
import { Department } from '../department/department.entity';
import e from 'express';
import { UpdateStatusImportRequestDTO } from './dto/update-status-import-request.dto';

describe('ImportRequestController', () => {
    let app: INestApplication;
    let adminToken: string;

    let importRequestService: ImportRequestService;
    let importRequestItemService: ImportRequestItemService;
    let departmentService: DepartmentService;
    let adminUser: User;
    let department: Department;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        adminUser = superAdminUser;

        importRequestService = await app.resolve<ImportRequestService>(ImportRequestService);
        departmentService = await app.resolve<DepartmentService>(DepartmentService);
        importRequestItemService = await app.resolve<ImportRequestItemService>(ImportRequestItemService);
        department = await departmentService.createDepartment({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateImportRequestDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/import-request`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: CreateImportRequestDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            };

            const res = await reqApi(dto);

            const importRequest = await importRequestService.getOneByField('id', res.body.id);

            expect(importRequest).toBeDefined();

            expect(importRequest.description).toBe(dto.description);
            expect(importRequest.name).toBe(dto.name);
            expect(importRequest.updatedBy.id).toBe(adminUser.id);
            expect(importRequest.createdBy.id).toBe(adminUser.id);
            expect(importRequest.department.id).toBe(department.id);
            expect(importRequest.importRequestItems.length).toBe(2);
            expect(importRequest.status).toBe(ImportRequestStatus.DRAFT);
            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Pass empty department', async () => {
            const dto: CreateImportRequestDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: null,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            };

            const res = await reqApi(dto);

            const importRequest = await importRequestService.getOneByField('id', res.body.id);

            expect(importRequest).toBeDefined();

            expect(importRequest.description).toBe(dto.description);
            expect(importRequest.name).toBe(dto.name);
            expect(importRequest.updatedBy.id).toBe(adminUser.id);
            expect(importRequest.createdBy.id).toBe(adminUser.id);
            expect(importRequest.department).toBeNull();
            expect(importRequest.status).toBe(ImportRequestStatus.DRAFT);
            expect(res.status).toBe(HttpStatus.CREATED);
        });
    });

    describe('POST /:id/item', () => {
        const reqApi = (id: string, dto: AddImportRequestItemDTO) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/import-request/${id}/item`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importRequest: ImportRequest;

        beforeEach(async () => {
            importRequest = await importRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [],
            });
        });

        it('Pass', async () => {
            const dto: AddImportRequestItemDTO = {
                quantity: 10,
                equipmentId: null,
                supplyId: null,
            };

            const res = await reqApi(importRequest.id, dto);

            const updatedImportRequest = await importRequestService.getOneByField('id', importRequest.id);

            const importRequestItem = await updatedImportRequest.importRequestItems.find((e) => e.id === res.body.id);
            expect(res.status).toBe(HttpStatus.CREATED);
            expect(importRequestItem).toBeDefined();
            expect(importRequestItem.quantity).toBe(dto.quantity);
            expect(importRequest.department.id).toBe(department.id);
        });
    });

    describe('PUT /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string, dto: UpdateImportRequestItemDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-request/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importRequest: ImportRequest;

        beforeEach(async () => {
            importRequest = await importRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            });

            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });

            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });

            importRequest = await importRequestService.getOneByField('id', importRequest.id);
        });

        it('Pass update item', async () => {
            const dto: UpdateImportRequestItemDTO = {
                quantity: 2,

                equipmentId: null,
                supplyId: null,
            };

            const importRequestItem = importRequest.importRequestItems[0];

            const res = await reqApi(importRequest.id, importRequestItem.id, dto);

            const updatedImportRequest = await importRequestItemService.getOneByField('id', importRequestItem.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportRequest.quantity).toBe(dto.quantity);
        });
    });

    describe('PUT /:id/cancel', () => {
        const reqApi = (id: string, dto: UpdateStatusImportRequestDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-request/${id}/cancel`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importRequest: ImportRequest;

        beforeEach(async () => {
            importRequest = await importRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            });

            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });
            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });

            importRequest = await importRequestService.getOneByField('id', importRequest.id);
        });

        it('Pass', async () => {
            const res = await reqApi(importRequest.id, {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            const updatedImportRequest = await importRequestService.getOneByField('id', importRequest.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportRequest.status).toBe(ImportRequestStatus.CANCELLED);
        });
    });

    describe('PUT /:id/approve', () => {
        const reqApi = (id: string, dto: UpdateStatusImportRequestDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-request/${id}/approve`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importRequest: ImportRequest;

        beforeEach(async () => {
            importRequest = await importRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            });
            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });
            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });

            importRequest = await importRequestService.getOneByField('id', importRequest.id);
        });

        it('Pass', async () => {
            await importRequestService.submitImportRequest(adminUser, importRequest.id);

            const res = await reqApi(importRequest.id, {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            const updatedImportRequest = await importRequestService.getOneByField('id', importRequest.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportRequest.status).toBe(ImportRequestStatus.APPROVED);
        });

        it('Fail request is not submitted', async () => {
            const res = await reqApi(importRequest.id, {
                note: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
            const updatedImportRequest = await importRequestService.getOneByField('id', importRequest.id);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
            expect(updatedImportRequest.status).toBe(ImportRequestStatus.DRAFT);
        });
    });

    describe('PUT /:id/submit', () => {
        const reqApi = (id: string) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-request/${id}/submit`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let importRequest: ImportRequest;

        beforeEach(async () => {
            importRequest = await importRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            });
            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });
            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });

            importRequest = await importRequestService.getOneByField('id', importRequest.id);
        });

        it('Pass', async () => {
            const res = await reqApi(importRequest.id);
            const updatedImportRequest = await importRequestService.getOneByField('id', importRequest.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportRequest.status).toBe(ImportRequestStatus.REQUESTING);
        });

        it('Pass item is empty', async () => {
            await NKGlobal.entityManager.delete(ImportRequestItem, {
                importRequest: { id: importRequest.id },
            });

            const res = await reqApi(importRequest.id);
            const updatedImportRequest = await importRequestService.getOneByField('id', importRequest.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportRequest.status).toBe(ImportRequestStatus.REQUESTING);
        });
    });

    describe('DELETE /:id/item/:itemId', () => {
        const reqApi = (id: string, itemId: string) =>
            supertest(app.getHttpServer())
                .delete(`/api/v1/import-request/${id}/item/${itemId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send();

        let importRequest: ImportRequest;

        beforeEach(async () => {
            importRequest = await importRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            });

            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });
            await importRequestService.addImportRequestItem(adminUser, importRequest.id, {
                quantity: 1,

                equipmentId: null,
                supplyId: null,
            });

            importRequest = await importRequestService.getOneByField('id', importRequest.id);
        });

        it('Pass', async () => {
            const res = await reqApi(importRequest.id, importRequest.importRequestItems[0].id);
            const updatedImportRequest = await importRequestService.getOneByField('id', importRequest.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(updatedImportRequest.importRequestItems.length).toBe(3);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateImportRequestDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/import-request/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let importRequest: ImportRequest;

        beforeEach(async () => {
            importRequest = await importRequestService.createOne(adminUser, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
                importRequestItems: [
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                    {
                        quantity: 10,
                        equipmentId: null,
                        supplyId: null,
                    },
                ],
            });
        });

        it('Pass', async () => {
            const dto: UpdateImportRequestDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
            };

            const res = await reqApi(importRequest.id, dto);
            const updatedRepairRequest = await importRequestService.getOneByField('id', importRequest.id);

            expect(updatedRepairRequest).toBeDefined();

            expect(updatedRepairRequest.updatedBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.createdBy.id).toBe(adminUser.id);
            expect(updatedRepairRequest.status).toBe(ImportRequestStatus.DRAFT);
            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail status is not draft', async () => {
            const dto: UpdateImportRequestDTO = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                departmentId: department.id,
            };
            await NKGlobal.entityManager.update(
                ImportRequest,
                { id: importRequest.id },
                { status: ImportRequestStatus.APPROVED },
            );
            const res = await reqApi(importRequest.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
