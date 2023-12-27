import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { initTestModule } from '../core/test/initTest';

import { UserService } from '../user/user.service';

import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { fakeData } from '../core/test/helper';
import { genUUID } from '../core/util';
import { Department } from '../department/department.entity';
import { DepartmentService } from '../department/department.service';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { UserRole } from '../user-role/user-role.entity';
import { UserRoleService } from '../user-role/user-role.service';
import { UserToken } from '../user-token/user-token.entity';
import { User, UserGender, UserStatus } from '../user/user.entity';
import { CreateStockerDto } from './dto/create-stocker.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAdminService } from './user-admin.service';

describe('UserAdminController', () => {
    let app: INestApplication;
    let adminToken: string;
    let userService: UserService;
    let authService: AuthService;
    let userRoleService: UserRoleService;
    let userAdminService: UserAdminService;
    let departmentService: DepartmentService;
    let department: Department;
    let createFakeUser: () => Promise<{
        user: User;
        token: UserToken;
    }>;

    beforeAll(async () => {
        const { getApp, superAdminToken, createUser } = await initTestModule();
        app = getApp;
        createFakeUser = createUser;

        adminToken = superAdminToken.token;
        userService = await app.resolve<UserService>(UserService);
        authService = await app.resolve<AuthService>(AuthService);
        userAdminService = await app.resolve<UserAdminService>(UserAdminService);
        userRoleService = await app.resolve<UserRoleService>(UserRoleService);
        departmentService = await app.resolve<DepartmentService>(DepartmentService);
    });

    beforeEach(async () => {
        department = await departmentService.createDepartment({
            name: fakeData(10, 'letters'),
            description: fakeData(10, 'letters'),
        });
    });

    describe('POST /create-user', () => {
        const reqApi = (dto: CreateStockerDto) =>
            supertest(app.getHttpServer())
                .post('/api/v1/user-admin/create-user')
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: CreateUserDto = {
                password: '131367Aa@',
                startWorkDate: new Date(),
                username: fakeData(10, 'letters'),
                roleId: genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER),
                departmentId: department.id,
            };

            const res = await reqApi(dto);

            const user = await userService.getOneByField('username', dto.username);
            expect(res.status).toBe(HttpStatus.CREATED);
            expect(user.username).toBe(dto.username);
            expect(user.role.id).toBe(genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER));
            expect(user.startWorkDate.toString()).toBe(dto.startWorkDate.toString());
            expect(user.department.id).toBe(department.id);
        });

        it('Pass: create user with department', async () => {
            const dto: CreateUserDto = {
                password: '131367Aa@',
                startWorkDate: new Date(),
                username: fakeData(10, 'letters'),
                roleId: genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER),
                departmentId: department.id,
            };

            const res = await reqApi(dto);

            const user = await userService.getOneByField('username', dto.username);
            expect(res.status).toBe(HttpStatus.CREATED);
            expect(user.username).toBe(dto.username);
            expect(user.role.id).toBe(genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER));
            expect(user.startWorkDate.toString()).toBe(dto.startWorkDate.toString());
            expect(user.department.id).toBe(department.id);
        });

        it('Fail: username is taken', async () => {
            const dto: CreateUserDto = {
                password: '131367Aa@',
                username: fakeData(10, 'letters'),
                startWorkDate: new Date(),
                departmentId: '',
                roleId: genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER),
            };
            await reqApi(dto);

            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail: wrong department id', async () => {
            const dto: CreateUserDto = {
                password: '131367Aa@',
                username: fakeData(10, 'letters'),
                startWorkDate: new Date(),
                departmentId: uuidv4(),
                roleId: genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER),
            };

            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /update-user/:id', () => {
        const reqApi = (userId: string, dto: UpdateUserDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/user-admin/update-user/${userId}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);
        let user: User;

        beforeEach(async () => {
            user = (await createFakeUser()).user;
        });

        it('Pass', async () => {
            const roles = await userRoleService.getAll();
            const dto: UpdateUserDto = {
                address: 'address',
                name: 'name',
                gender: UserGender.MALE,
                password: '131367Aa@',
                phone: 'phone',
                citizenId: fakeData(10, 'number'),
                roleId: roles[0].id,
                birthday: new Date(),
                departmentId: department.id,
                status: UserStatus.ACTIVE,
            };

            const res = await reqApi(user.id, dto);

            const userUpdated = await userService.getOneByField('id', user.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(userUpdated.address).toBe(dto.address);
            expect(userUpdated.name).toBe(dto.name);
            expect(userUpdated.address).toBe(dto.address);
            expect(userUpdated.phone).toBe(dto.phone);
            expect(userUpdated.citizenId).toBe(dto.citizenId);
            expect(userUpdated.birthday.toString()).toBe(dto.birthday.toString());
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
