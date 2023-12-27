import { Injectable } from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { UserTokenService } from '../user-token/user-token.service';
import { hashPassword } from '../core/util/encrypt.helper';
import { NKGlobal } from '../core/common/NKGlobal';
import { User } from '../user/user.entity';
import { NKService } from '../core/decorators/NKService.decorator';

@NKService()
export class UserAnonymousService {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly userTokenService: UserTokenService,
    ) {}

    async resetPassword(data: ResetPasswordDto) {
        this.authService.checkPasswordPolicy(data.password);

        const token = await this.userTokenService.validateAnonymousOtp(data.token);

        const user = await this.userService.getOneByField('id', token.user.id);

        const newPassword = await hashPassword(data.password);

        await NKGlobal.entityManager.update(User, { id: user.id }, { password: newPassword });
    }
}
