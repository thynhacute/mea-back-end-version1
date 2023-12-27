import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { BrandService } from './brand.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { Brand, BrandStatus } from './brand.entity';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { JoiValidatorPipe } from '../core/pipe';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { kebabCase } from 'lodash';
import { Colors } from '../core/util/colors.helper';

@NKAuthController({
    model: {
        type: Brand,
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
    selectOptionField: 'code',
    query: {
        isShowDelete: false,
        relations: [],
    },
})
export class BrandController extends NKCurdControllerBase<Brand> {
    constructor(private readonly brandService: BrandService) {
        const reflector = new Reflector();
        brandService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, BrandController);
        super(brandService);
    }

    @NKMethodRouter(Post('/'))
    postOne(@Body(new JoiValidatorPipe(CreateBrandDto.validate)) body: CreateBrandDto) {
        return this.brandService.createOne(body);
    }

    @NKMethodRouter(Put('/:id'))
    putOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new JoiValidatorPipe(UpdateBrandDto.validate)) body: UpdateBrandDto,
    ) {
        return this.brandService.updateOne(id, body);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: BrandStatus.ACTIVE,
                label: 'Hoạt động',
                name: 'Hoạt động',
                value: BrandStatus.ACTIVE,
                color: Colors.GREEN,
                slug: kebabCase(BrandStatus.ACTIVE),
            },
            {
                id: BrandStatus.INACTIVE,
                label: 'Không hoạt động',
                name: 'Không hoạt động',
                value: BrandStatus.INACTIVE,
                color: Colors.RED,
                slug: kebabCase(BrandStatus.INACTIVE),
            },
        ];
    }
}
