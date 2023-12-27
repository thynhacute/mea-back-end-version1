import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NKController } from '../core/decorators/NKController.decorator';
import { LoginWithEmailDto, LoginWithUsernameDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { NKRouter } from '../core/decorators/NKRouter.decorator';
import { RegisterWithEmailDto } from './dto/register.dto';
import { JoiValidatorPipe } from '../core/pipe';

@NKController({
    apiName: 'auth',
})
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // @NKRouter({
    //     method: Post('/login'),
    // })
    // async login(@Body() body: LoginWithEmailDto) {
    //     return this.authService.loginWithEmail(body);
    // }
    @NKRouter({
        method: Post('/login'),
    })
    async login(@Body(new JoiValidatorPipe(LoginWithUsernameDto.validate)) body: LoginWithUsernameDto) {
        return this.authService.loginWithUsername(body);
    }

    // @NKRouter({
    //     method: Post('/register'),
    // })
    // async register(@Body() body: RegisterWithEmailDto) {
    //     return this.authService.registerWithEmail(body);
    // }
}
