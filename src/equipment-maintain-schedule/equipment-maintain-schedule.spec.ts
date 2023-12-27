import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';
import { Department } from '../department/department.entity';
import { DepartmentService } from '../department/department.service';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';

import { UpdateEquipmentMaintainScheduleDTO } from './dto/update-equipment-maintain-schedule.dto';
import { EquipmentMaintainScheduleService } from './equipment-maintain-schedule.service';
import { EquipmentService } from '../equipment/equipment.service';
import { Equipment } from '../equipment/equipment.entity';
import { EquipmentMaintainSchedule } from './equipment-maintain-schedule.entity';
import { NKGlobal } from '../core/common/NKGlobal';
import { EquipmentMaintainScheduleCron } from './equipment-maintain-schedule.cron';
import { UserNotification, UserNotificationActionType } from '../user-notification/user-notification.entity';

describe('EquipmentMaintainScheduleController', () => {
    let app: INestApplication;
    let adminToken: string;
    let equipmentService: EquipmentService;
    let equipmentCategoryService: EquipmentCategoryService;
    let equipmentCategory: EquipmentCategory;
    let departmentService: DepartmentService;
    let department: Department;
    let equipmentMaintainScheduleService: EquipmentMaintainScheduleService;
    let equipmentMaintainScheduleCron: EquipmentMaintainScheduleCron;

    beforeAll(async () => {
        const { getApp, superAdminToken } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        equipmentService = await app.resolve<EquipmentService>(EquipmentService);
        equipmentCategoryService = await app.resolve<EquipmentCategoryService>(EquipmentCategoryService);
        departmentService = await app.resolve<DepartmentService>(DepartmentService);
        equipmentMaintainScheduleCron = await app.resolve<EquipmentMaintainScheduleCron>(EquipmentMaintainScheduleCron);
        equipmentMaintainScheduleService = await app.resolve<EquipmentMaintainScheduleService>(
            EquipmentMaintainScheduleService,
        );

        equipmentCategory = await equipmentCategoryService.createOne({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
            code: fakeData(10, 'lettersAndNumbersLowerCase'),
        });

        department = await departmentService.createDepartment({
            description: fakeData(10, 'lettersAndNumbersLowerCase'),
            name: fakeData(10, 'lettersAndNumbersLowerCase'),
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateEquipmentMaintainScheduleDTO) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/equipment-maintain-schedule/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let equipment: Equipment;

        beforeEach(async () => {
            equipment = (await equipmentService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,

                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
                equipmentStatus: EquipmentStatusType.ACTIVE,
            })) as Equipment;
        });

        it('Pass', async () => {
            const dto: UpdateEquipmentMaintainScheduleDTO = {
                cycleMaintainPerMonth: 20,
            };

            const testEquipment = await equipmentService.getOneByField('id', equipment.id);
            const res = await reqApi(testEquipment.equipmentMaintainSchedules.id, dto);

            const equipmentMaintainSchedule = await equipmentMaintainScheduleService.getOneByField(
                'id',
                testEquipment.equipmentMaintainSchedules.id,
            );

            expect(equipmentMaintainSchedule.cycleMaintainPerMonth).toBe(dto.cycleMaintainPerMonth);

            expect(res.status).toBe(HttpStatus.OK);
        });
    });

    describe('Test cron', () => {
        let equipment: Equipment;

        beforeEach(async () => {
            equipment = (await equipmentService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                endOfWarrantyDate: new Date(),
                equipmentCategoryId: equipmentCategory.id,

                imageUrls: [fakeData(10, 'lettersAndNumbersLowerCase')],
                importDate: new Date(),
                mfDate: new Date(),
                equipmentStatus: EquipmentStatusType.ACTIVE,
            })) as Equipment;

            equipment = await equipmentService.getOneByField('id', equipment.id);

            const lastMonthAndOneDay = new Date(new Date().setMonth(new Date().getMonth() - 1));
            lastMonthAndOneDay.setDate(lastMonthAndOneDay.getDate() + 1);

            //update cycleMaintainPerMonth and lastNotifyDate to last month

            await NKGlobal.entityManager.update(EquipmentMaintainSchedule, equipment.equipmentMaintainSchedules.id, {
                cycleMaintainPerMonth: 1,
                lastNotifyDate: lastMonthAndOneDay,
                lastMaintainDate: lastMonthAndOneDay,
            });
        });

        it('Pass', async () => {
            // delete all notification
            await NKGlobal.entityManager.delete(UserNotification, {
                actionType: UserNotificationActionType.MAINTENANCE_SCHEDULE,
            });
            await equipmentMaintainScheduleCron.handleCron();

            const notification = await NKGlobal.entityManager.find(UserNotification, {
                where: {
                    actionType: UserNotificationActionType.MAINTENANCE_SCHEDULE,
                },
                relations: ['user'],
            });

            expect(notification.length).toBeGreaterThanOrEqual(1);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
