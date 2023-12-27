import { HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { NKGlobal } from '../core/common/NKGlobal';
import { ChangePasswordDto } from './dto/change-password.dto';
import { comparePassword, hashPassword } from '../core/util/encrypt.helper';
import { AuthService } from '../auth/auth.service';
import { NKResponseException, nkMessage } from '../core/exception';
import { User } from '../user/user.entity';
import { UserTokenService } from '../user-token/user-token.service';
import { SenderType } from '../sender/sender.entity';
import { QueueService } from '../core/queue/queue.service';

@Injectable()
export class UserMeService {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly userTokenService: UserTokenService,
        private readonly queueService: QueueService,
    ) {}

    async updateMe(id: string, data: UpdateMeDto) {
        const user = await this.userService.getOneByField('id', id);
        await this.userService.validateUniqueField('email', data.email, user.id);
        user.name = data.name;
        user.address = data.address;
        user.phone = data.phone;
        user.gender = data.gender;
        user.birthday = data.birthday;
        user.email = data.email;
        user.isRequiredUpdate = false;
        if (data.deviceId) user.deviceId = data.deviceId;

        return NKGlobal.entityManager.save(user);
    }

    async changePassword(id: string, newPassword: ChangePasswordDto) {
        this.authService.checkPasswordPolicy(newPassword.newPassword);

        const user = await this.userService.getOneByField('id', id);
        const isMatchOldPassword = await comparePassword(newPassword.password, user.password);
        if (!isMatchOldPassword) {
            throw new NKResponseException(nkMessage.error.passwordNotMatch, HttpStatus.BAD_REQUEST);
        }

        user.password = await hashPassword(newPassword.newPassword);

        return await NKGlobal.entityManager.save(user);
    }

    async createResetPasswordToken(user: User) {
        const userToken = await this.userTokenService.createResetPassword(user, NKGlobal.entityManager);

        await this.queueService.addSendMessage({
            message: 'Your code is ' + userToken.value,
            receiver: user.email,
            type: SenderType.EMAIL,
            extraData: {
                subject: 'Reset password',
            },
        });

        return userToken.token;
    }
}
