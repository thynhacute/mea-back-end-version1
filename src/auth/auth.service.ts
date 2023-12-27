import { HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginWithEmailDto, LoginWithUsernameDto } from './dto/login.dto';
import { comparePassword, generateToken, hashPassword } from '../core/util/encrypt.helper';
import { NKResponseException, nkMessage } from '../core/exception';
import { RegisterWithEmailDto } from './dto/register.dto';
import { User } from '../user/user.entity';
import { NKGlobal } from '../core/common/NKGlobal';
import { UserRole } from '../user-role/user-role.entity';
import { genUUID } from '../core/util';
import { UserRoleIndex } from '../user-role/user-role.constant';
import joi from 'joi';
import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import { UserTokenService } from '../user-token/user-token.service';

const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private readonly userTokenService: UserTokenService) {}

    checkPasswordPolicy(password: string) {
        const { error } = joiPassword
            .string()
            .min(8)
            .max(255)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .validate(password);

        if (error) {
            throw new NKResponseException(nkMessage.error.passwordPolicy, HttpStatus.BAD_REQUEST);
        }
    }

    async loginWithEmail(dto: LoginWithEmailDto) {
        const user = await this.userService.getOneByField('email', dto.email, false);

        if (!user) {
            throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        }

        const isMatch = await comparePassword(dto.password, user.password);
        if (!isMatch) {
            throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        }

        const userToken = await this.userTokenService.createAuth(user, NKGlobal.entityManager);

        return {
            token: userToken.token,
        };
    }

    async loginWithUsername(dto: LoginWithUsernameDto) {
        const user = await this.userService.getOneByField('username', dto.username, false);

        if (!user) {
            throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        }

        const isMatch = await comparePassword(dto.password, user.password);
        if (!isMatch) {
            throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        }

        const userToken = await this.userTokenService.createAuth(user, NKGlobal.entityManager);

        return {
            token: userToken.token,
            user: user,
        };
    }

    async registerWithEmail(dto: RegisterWithEmailDto) {
        const existedUser = await NKGlobal.entityManager.findOne(User, {
            where: {
                email: dto.email,
            },
        });

        if (existedUser) {
            throw new NKResponseException(nkMessage.error.fieldTaken, HttpStatus.BAD_REQUEST);
        }

        this.checkPasswordPolicy(dto.password);

        const user = await this.createUser(dto);
        const token = await this.userTokenService.createAuth(user, NKGlobal.entityManager);

        return {
            token,
            user,
        };
    }

    async createUser(dto: RegisterWithEmailDto) {
        return NKGlobal.entityManager.save(User, {
            email: dto.email,
            password: await hashPassword(dto.password),
            name: dto.name,
            phone: dto.phone,
            address: dto.address,
            role: await NKGlobal.entityManager.findOne(UserRole, {
                where: {
                    id: genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER),
                },
            }),
        });
    }
}
