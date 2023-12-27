import { INestApplication } from '@nestjs/common';
import { initTestModule } from '../core/test/initTest';

import supertest from 'supertest';

import { User } from '../user/user.entity';
import { fakeData } from '../core/test/helper';
import { NKGlobal } from '../core/common/NKGlobal';
import { UserNotificationService } from '../user-notification/user-notification.service';
import {
    UserNotification,
    UserNotificationActionType,
    UserNotificationStatus,
} from '../user-notification/user-notification.entity';

describe('UserMeNotificationController', () => {
    let app: INestApplication;
    let adminToken: string;
    let userNotificationService: UserNotificationService;
    let user: User;
    let userAccessToken: string;

    beforeAll(async () => {
        const { getApp, superAdminToken, createUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        userNotificationService = await app.resolve<UserNotificationService>(UserNotificationService);
        const newUser = await createUser();
        user = newUser.user;
        userAccessToken = newUser.token.token;
    });

    describe('PUT /mark-as-read', () => {
        const reqApi = () =>
            supertest(app.getHttpServer())
                .put(`/api/v1/user-me-notification/mark-as-read`)
                .set({ authorization: 'Bearer ' + userAccessToken })
                .send();

        beforeEach(async () => {
            await userNotificationService.sendNotification({
                actionType: UserNotificationActionType.LINK,
                actionId: '123',
                content: fakeData(10, 'lettersAndNumbersLowerCase'),
                title: '123',
                receiverIds: [user.id],
                senderId: '',
            });
        });

        it('Pass', async () => {
            const res = await reqApi();

            const userNotifications = await NKGlobal.entityManager.find(UserNotification, {
                where: {
                    user: {
                        id: user.id,
                    },
                    isDeleted: false,
                    status: UserNotificationStatus.UNREAD,
                },
                relations: ['user'],
            });

            expect(res.status).toBe(200);
            expect(userNotifications.length).toBe(0);
        });
    });

    describe('PUT /mark-as-read-detail', () => {
        const reqApi = (notificationId: string) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/user-me-notification/mark-as-read-detail/${notificationId}`)
                .set({ authorization: 'Bearer ' + userAccessToken })
                .send();

        beforeEach(async () => {
            await userNotificationService.sendNotification({
                actionType: UserNotificationActionType.LINK,
                actionId: '123',
                content: fakeData(10, 'lettersAndNumbersLowerCase'),
                title: '123',
                receiverIds: [user.id],
                senderId: '',
            });
        });

        it('Pass', async () => {
            const userNotifications = await NKGlobal.entityManager.find(UserNotification, {
                where: {
                    user: {
                        id: user.id,
                    },
                    isDeleted: false,
                    status: UserNotificationStatus.UNREAD,
                },
                relations: ['user'],
            });

            const res = await reqApi(userNotifications[0].id);

            const userNotificationsAfter = await NKGlobal.entityManager.find(UserNotification, {
                where: {
                    id: userNotifications[0].id,
                    isDeleted: false,
                    status: UserNotificationStatus.READ_DETAIL,
                },
                relations: ['user'],
            });

            expect(res.status).toBe(200);
            expect(userNotificationsAfter.length).toBe(1);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
