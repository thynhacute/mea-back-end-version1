import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AuthService } from '../../auth/auth.service';
import { router } from '../router';
import { UserService } from '../../user/user.service';
import { fakeData } from './helper';
jest.setTimeout(100000);
const resetDatabase = async (module: TestingModule) => {};

export const initTestModule = async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const configModule = module.createNestApplication();
    //apply middleware
    await router(configModule);
    const getApp = await configModule.init();

    //create a fake user and token

    const authService = await module.resolve<AuthService>(AuthService);
    const userService = await module.resolve<UserService>(UserService);

    try {
        return {
            resetDatabase: async () => await resetDatabase(module),
            superAdminToken: await authService.loginWithEmail({
                email: 'superadmin@gmail.com',
                password: '123456Aa@',
            }),
            superAdminUser: await userService.getOneByField('email', 'superadmin@gmail.com'),
            createUser: async () => {
                const res = await authService.registerWithEmail({
                    address: 'test',
                    email: `${fakeData(10, 'letters')}@gmail.com`,
                    name: fakeData(10, 'letters'),
                    password: '123456Aa@',
                    phone: '123456',
                });

                return {
                    user: await userService.getOneByField('email', res.user.email),
                    token: res.token,
                };
            },

            getApp,
            module,
            configModule,
        };
    } catch (error) {
        console.log(error);
    }
};
