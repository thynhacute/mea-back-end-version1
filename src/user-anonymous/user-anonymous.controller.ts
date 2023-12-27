import { Body, Controller, Put } from '@nestjs/common';
import { UserAnonymousService } from './user-anonymous.service';
import { NKController } from '../core/decorators/NKController.decorator';
import { NKRouter } from '../core/decorators/NKRouter.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JoiValidatorPipe } from '../core/pipe';

@NKController({
    apiName: 'user-anonymous',
})
export class UserAnonymousController {
    constructor(private readonly userAnonymousService: UserAnonymousService) {}

    @NKRouter({
        method: Put('/reset-password'),
    })
    updateResetPassword(@Body(new JoiValidatorPipe(ResetPasswordDto.validate)) body: ResetPasswordDto) {
        return this.userAnonymousService.resetPassword(body);
    }
}
