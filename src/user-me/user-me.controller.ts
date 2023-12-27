import { Body, Get, Post, Put, Req } from '@nestjs/common';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { NKRouter } from '../core/decorators/NKRouter.decorator';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKControllerBase } from '../core/common/NKControllerBase';
import { User } from '../user/user.entity';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserMeService } from './user-me.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserTokenService } from '../user-token/user-token.service';
import { nkMessage } from '../core/exception';
import { JoiValidatorPipe } from '../core/pipe';

@NKAuthController({
    apiName: 'UserMe',
    query: {
        relations: ['role'],
    },
})
export class UserMeController extends NKControllerBase<User> {
    constructor(
        private readonly userService: UserService,
        private readonly userMeService: UserMeService,
        private userTokenService: UserTokenService,
    ) {
        const reflector = new Reflector();
        userService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, UserMeController);

        super(userService);
    }

    @NKRouter({
        method: Get('/'),
    })
    getMe(@Req() req: Request) {
        return this.userService.getOneByField('id', req.user.id);
    }

    @NKRouter({
        method: Put('/'),
    })
    updateMe(@Req() req: Request, @Body(new JoiValidatorPipe(UpdateMeDto.validate)) body: UpdateMeDto) {
        return this.userMeService.updateMe(req.user.id, body);
    }

    @NKRouter({
        method: Put('/change-password'),
    })
    changePassword(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(ChangePasswordDto.validate)) body: ChangePasswordDto,
    ) {
        return this.userMeService.changePassword(req.user.id, body);
    }

    @NKRouter({
        method: Post('/logout'),
    })
    async logout(@Req() req: Request) {
        await this.userTokenService.destroyAuth(req.user);
        return nkMessage.message.logout;
    }

    @NKRouter({
        method: Post('/reset-password'),
    })
    async sendResetPassword(@Req() req: Request) {
        await this.userMeService.createResetPasswordToken(req.user);
        return nkMessage.message.sendResetPassword;
    }
}
