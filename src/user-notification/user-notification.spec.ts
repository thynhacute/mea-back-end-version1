import { INestApplication } from '@nestjs/common';
import { initTestModule } from '../core/test/initTest';
import { UserNotificationService } from './user-notification.service';
import { SendUserNotificationDto } from './dto/send-user-notification.dto';
import supertest from 'supertest';
import { UserNotification, UserNotificationActionType, UserNotificationStatus } from './user-notification.entity';
import { User } from '../user/user.entity';
import { fakeData } from '../core/test/helper';
import { NKGlobal } from '../core/common/NKGlobal';

describe('UserNotificationController', () => {
    let app: INestApplication;
    let adminToken: string;
    let userNotificationService: UserNotificationService;
    let user: User;

    beforeAll(async () => {
        const { getApp, superAdminToken, createUser } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        userNotificationService = await app.resolve<UserNotificationService>(UserNotificationService);
        user = (await createUser()).user;
    });

    describe('POST /send', () => {
        const reqApi = (dto: SendUserNotificationDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/user-notification/send`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const dto: SendUserNotificationDto = {
                actionType: UserNotificationActionType.LINK,
                actionId: '123',
                content: fakeData(10, 'lettersAndNumbersLowerCase'),
                title: '123',
                receiverIds: [user.id],
                senderId: '',
            };

            const res = await reqApi(dto);

            const userNotification = await NKGlobal.entityManager.findOne(UserNotification, {
                where: {
                    user: {
                        id: user.id,
                    },
                    content: dto.content,
                },
            });

            expect(res.status).toBe(201);
            expect(userNotification).toBeDefined();
            expect(userNotification.actionType).toBe(dto.actionType);
            expect(userNotification.status).toBe(UserNotificationStatus.UNREAD);
        });

        it('Pass send with senderId', async () => {
            const dto: SendUserNotificationDto = {
                actionType: UserNotificationActionType.LINK,
                actionId: '123',
                content: fakeData(10, 'lettersAndNumbersLowerCase'),
                title: '123',
                receiverIds: [user.id],
                senderId: user.id,
            };

            const res = await reqApi(dto);

            const userNotification = await NKGlobal.entityManager.findOne(UserNotification, {
                where: {
                    user: {
                        id: user.id,
                    },
                    sender: {
                        id: user.id,
                    },
                    content: dto.content,
                },
                relations: ['sender'],
            });

            expect(res.status).toBe(201);
            expect(userNotification).toBeDefined();
            expect(userNotification.actionType).toBe(dto.actionType);
            expect(userNotification.status).toBe(UserNotificationStatus.UNREAD);
            expect(userNotification.sender.id).toBe(user.id);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
