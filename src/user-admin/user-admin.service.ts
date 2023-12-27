import { HttpStatus } from '@nestjs/common';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKService } from '../core/decorators/NKService.decorator';
import { NKResponseException, nkMessage } from '../core/exception';
import { genUUID } from '../core/util';
import { hashPassword } from '../core/util/encrypt.helper';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { UserRole } from '../user-role/user-role.entity';
import { UserRoleService } from '../user-role/user-role.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { CreateStockerDto } from './dto/create-stocker.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { DepartmentService } from '../department/department.service';

@NKService()
export class UserAdminService {
    constructor(
        private readonly userService: UserService,
        private readonly userRoleService: UserRoleService,
        private readonly authService: AuthService,
        private readonly departmentService: DepartmentService,
    ) {}

    async validateUniqueCitizenId(citizenId: string) {
        if (!citizenId) {
            return;
        }

        const existedUser = await NKGlobal.entityManager.findOne(User, {
            where: {
                citizenId,
            },
        });
        if (existedUser) {
            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST);
        }
    }

    async createUser(user: User, dto: CreateUserDto) {
        await this.authService.checkPasswordPolicy(dto.password);

        const currentCreateUser = await NKGlobal.entityManager.findOne(User, {
            where: {
                id: user.id,
            },
            relations: ['role'],
        });
        const createUserRole = await this.userRoleService.getOneByField('id', dto.roleId);
        if (!this.userRoleService.isCheckHigherRoleThanTarget(currentCreateUser.role, createUserRole)) {
            throw new NKResponseException(nkMessage.error.permissionDenied, HttpStatus.FORBIDDEN);
        }

        const existedUser = await NKGlobal.entityManager.findOne(User, {
            where: {
                username: dto.username,
            },
        });
        if (existedUser) {
            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST, {
                field: 'Username',
            });
        }

        if (dto.departmentId) {
            await this.departmentService.getOneByField('id', dto.departmentId);
        }

        return await NKGlobal.entityManager.save(User, {
            username: dto.username,
            password: await hashPassword(dto.password),
            isRequiredUpdate: true,
            startWorkDate: dto.startWorkDate,
            role: {
                id: createUserRole.id,
            },
            department: dto.departmentId
                ? {
                      id: dto.departmentId,
                  }
                : null,
        });
    }

    async updateUser(user: User, updateUserId: string, dto: UpdateUserDto) {
        if (dto.password) await this.authService.checkPasswordPolicy(dto.password);
        const updateUser = await this.userService.getOneByField('id', updateUserId);
        const adminUser = await this.userService.getOneByField('id', user.id);

        if (!this.userRoleService.isCheckHigherRoleThanTarget(adminUser.role, updateUser.role)) {
            throw new NKResponseException(nkMessage.error.permissionDenied, HttpStatus.FORBIDDEN);
        }

        if (dto.roleId) {
            const updateUserRole = await this.userRoleService.getOneByField('id', dto.roleId);
            if (!this.userRoleService.isCheckHigherRoleThanTarget(user.role, updateUserRole)) {
                throw new NKResponseException(nkMessage.error.permissionDenied, HttpStatus.FORBIDDEN);
            }
            updateUser.role = updateUserRole;
        }

        if (dto.citizenId !== updateUser.citizenId) {
            await this.validateUniqueCitizenId(dto.citizenId);
        }

        return await NKGlobal.entityManager.update(
            User,
            { id: updateUserId },
            {
                name: dto.name,
                address: dto.address,
                phone: dto.phone,
                citizenId: dto.citizenId,
                birthday: dto.birthday,
                gender: dto.gender,
                status: dto.status,
                password: dto.password ? await hashPassword(dto.password) : updateUser.password,
                role: {
                    id: dto.roleId,
                },
                department: {
                    id: dto.departmentId,
                },
            },
        );
    }

    async createStocker(dto: CreateStockerDto) {
        const existedUser = await this.userService.getOneByField('username', dto.username, false);
        if (existedUser) {
            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST);
        }

        const stockerRole = await this.userRoleService.getOneByField('id', genUUID(UserRole.name, UserRoleIndex.ADMIN));

        return await NKGlobal.entityManager.save(User, {
            username: dto.username,
            password: await hashPassword(dto.password),
            startWorkDate: dto.startWorkDate,
            role: {
                id: stockerRole.id,
            },
        });
    }

    async createStaff(dto: CreateStaffDto) {
        const existedUser = await this.userService.getOneByField('username', dto.username, false);
        if (existedUser) {
            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST);
        }

        await this.departmentService.getOneByField('id', dto.departmentId);

        const staffRole = await this.userRoleService.getOneByField('id', dto.userRoleId);

        return await NKGlobal.entityManager.save(User, {
            username: dto.username,
            password: await hashPassword(dto.password),
            startWorkDate: dto.startWorkDate,
            role: {
                id: staffRole.id,
            },
            department: {
                id: dto.departmentId,
            },
        });
    }
}
