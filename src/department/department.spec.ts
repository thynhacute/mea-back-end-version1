import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';

import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department, DepartmentStatus } from './department.entity';

describe('DepartmentController', () => {
    let app: INestApplication;
    let adminToken: string;
    let departmentService: DepartmentService;

    beforeAll(async () => {
        const { getApp, superAdminToken } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        departmentService = await app.resolve<DepartmentService>(DepartmentService);
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateDepartmentDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/department`)
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
            const dto: CreateDepartmentDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            await reqApi(dto);
            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateDepartmentDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/department/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let department: Department;

        beforeEach(async () => {
            department = await departmentService.createDepartment({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
            });
        });

        it('Pass', async () => {
            const res = await reqApi(department.id, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: DepartmentStatus.ACTIVE,
            });

            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail Duplicate Name', async () => {
            const dto: UpdateDepartmentDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: DepartmentStatus.ACTIVE,
            };

            await departmentService.createDepartment(dto);
            const res = await reqApi(department.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
