import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { Department, DepartmentStatus } from './department.entity';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JoiValidatorPipe } from '../core/pipe';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { kebabCase } from 'lodash';
import { Colors } from '../core/util/colors.helper';

@NKAuthController({
    model: {
        type: Department,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.DELETE_ONE,
        RouterBaseMethodEnum.GET_SELECT_OPTION,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
    selectOptionField: 'name',

    query: {
        isShowDelete: false,
        relations: ['users'],
    },
})
export class DepartmentController extends NKCurdControllerBase<Department> {
    constructor(private readonly departmentService: DepartmentService) {
        const reflector = new Reflector();
        departmentService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, DepartmentController);
        super(departmentService);
    }

    @NKMethodRouter(Post('/'))
    postOne(@Body(new JoiValidatorPipe(CreateDepartmentDto.validate)) body: CreateDepartmentDto) {
        return this.departmentService.createDepartment(body);
    }

    @NKMethodRouter(Put('/:id'))
    putOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new JoiValidatorPipe(UpdateDepartmentDto.validate)) body: UpdateDepartmentDto,
    ) {
        return this.departmentService.updateDepartment(id, body);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: DepartmentStatus.ACTIVE,
                label: 'Hoạt động',
                name: 'Hoạt động',
                value: DepartmentStatus.ACTIVE,
                color: Colors.GREEN,
                slug: kebabCase('ACTIVE'),
            },
            {
                id: DepartmentStatus.INACTIVE,
                label: 'Không hoạt động',
                name: 'Không hoạt động',
                value: DepartmentStatus.INACTIVE,
                color: Colors.RED,
                slug: kebabCase('INACTIVE'),
            },
        ];
    }
}
