import { Body, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { NKRouter } from '../core/decorators/NKRouter.decorator';
import { JoiValidatorPipe } from '../core/pipe';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateStockerDto } from './dto/create-stocker.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAdminService } from './user-admin.service';
import { CreateUserDto } from './dto/create-user.dto';

@NKAuthController({
    apiName: 'UserAdmin',
    selectOptionField: 'name',
    query: {
        relations: ['role', 'department'],
    },
})
export class UserAdminController extends NKCurdControllerBase<User> {
    constructor(private readonly userService: UserService, private readonly userAdminService: UserAdminService) {
        const reflector = new Reflector();

        userService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, UserAdminController);

        super(userService);
    }

    //update user
    @NKRouter({
        method: Put('/update-user/:id'),
    })
    updateUser(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new JoiValidatorPipe(UpdateUserDto.validate))
        body: UpdateUserDto,
    ) {
        return this.userAdminService.updateUser(req.user, id, body);
    }

    // create user
    @NKRouter({
        method: Post('/create-user'),
    })
    createUser(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(CreateUserDto.validate))
        Body: CreateUserDto,
    ) {
        return this.userAdminService.createUser(req.user, Body);
    }

    // @NKRouter({
    //     method: Post('/create-stocker'),
    // })
    // createStocker(
    //     @Body(new JoiValidatorPipe(CreateStockerDto.validate))
    //     body: CreateStockerDto,
    // ) {
    //     return this.userAdminService.createStocker(body);
    // }

    // @NKRouter({
    //     method: Post('/create-staff'),
    // })
    // createStaff(
    //     @Body(new JoiValidatorPipe(CreateStaffDto.validate))
    //     body: CreateStaffDto,
    // ) {
    //     return this.userAdminService.createStaff(body);
    // }
}
