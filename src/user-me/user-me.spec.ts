import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';
import { UpdateMeDto } from './dto/update-me.dto';
import { User, UserGender } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { NKGlobal } from '../core/common/NKGlobal';
import { UserToken, UserTokenType } from '../user-token/user-token.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from '../auth/auth.service';
import { ResetPasswordDto } from '../user-anonymous/dto/reset-password.dto';
import { comparePassword } from '../core/util/encrypt.helper';

describe('UserMeController', () => {
    let app: INestApplication;
    let testToken: string;
    let userService: UserService;
    let authService: AuthService;
    let userInfo: User;

    beforeAll(async () => {
        const { getApp, superAdminToken, superAdminUser, createUser } = await initTestModule();
        app = getApp;
        const userObject = await createUser();

        testToken = userObject.token.value;
        userInfo = userObject.user;
        userService = await app.resolve<UserService>(UserService);
        authService = await app.resolve<AuthService>(AuthService);
    });

    describe('PUT /', () => {
        const reqApi = (dto: UpdateMeDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/user-me`)
                .set({ authorization: 'Bearer ' + testToken })
                .send(dto);

        it('Pass', async () => {
            const dto: UpdateMeDto = {
                address: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                phone: fakeData(10, 'lettersAndNumbersLowerCase'),
                gender: UserGender.MALE,
                birthday: new Date(),
                email: fakeData(10, 'lettersAndNumbersLowerCase') + '@gmail.com',
            };

            const res = await reqApi(dto);
            const user = await userService.getOneByField('id', res.body.id);

            expect(res.status).toBe(HttpStatus.OK);
            expect(user.address).toBe(dto.address);
            expect(user.name).toBe(dto.name);
            expect(user.phone).toBe(dto.phone);
            expect(user.gender).toBe(dto.gender);
        });
    });

    describe('POST /logout', () => {
        const reqApi = () =>
            supertest(app.getHttpServer())
                .post(`/api/v1/user-me/logout`)
                .set({ authorization: 'Bearer ' + testToken });

        it('Pass', async () => {
            const res = await reqApi();

            const userToken = await NKGlobal.entityManager.findOne(UserToken, {
                where: {
                    token: testToken,
                    isDeleted: false,
                },
                relations: ['user'],
            });
            expect(res.status).toBe(HttpStatus.CREATED);
            expect(userToken).toBeUndefined();
        });
    });

    describe('PUT /change-password', () => {
        const reqApi = (dto: ChangePasswordDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/user-me/change-password`)
                .set({ authorization: 'Bearer ' + testToken })
                .send(dto);

        beforeEach(async () => {
            await NKGlobal.entityManager.update(
                UserToken,
                {
                    token: testToken,
                },
                {
                    isDeleted: false,
                },
            );
        });

        it('Pass', async () => {
            const dto: ChangePasswordDto = {
                newPassword: '123456789Aa@',
                password: '123456Aa@',
            };

            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.OK);
            try {
                await authService.loginWithEmail({
                    email: 'superadmin@gmail.com',
                    password: '123456',
                });
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });

    describe('POST PUT /reset-password', () => {
        const createTokenApi = () =>
            supertest(app.getHttpServer())
                .post(`/api/v1/user-me/reset-password`)
                .set({ authorization: 'Bearer ' + testToken })
                .send();

        const updateTokenApi = (dto: ResetPasswordDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/user-anonymous/reset-password`)

                .send(dto);

        it('Pass', async () => {
            await createTokenApi();
            const token = await NKGlobal.entityManager.findOne(UserToken, {
                where: {
                    user: {
                        id: userInfo.id,
                    },
                    type: UserTokenType.RESET_PASSWORD,
                    isDeleted: false,
                },
                relations: ['user'],
            });

            const res = await updateTokenApi({
                password: '12345678Aa@',
                token: token.value,
            });

            expect(res.status).toBe(HttpStatus.OK);

            const user = await userService.getOneByField('id', token.user.id);
            expect(user.password).not.toBe(token.user.password);
            const isCorrect = await comparePassword('12345678Aa@', user.password);
            expect(isCorrect).toBeTruthy();
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
