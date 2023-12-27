import { Reflector } from '@nestjs/core';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { Sender } from './sender.entity';
import { SenderService } from './sender.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@NKAuthController({
    model: {
        type: Sender,
    },
    query: {
        isShowDelete: false,
    },
    baseMethods: [RouterBaseMethodEnum.GET_ALL, RouterBaseMethodEnum.GET_ONE, RouterBaseMethodEnum.GET_PAGING],
    isAllowDelete: false,
    permission: UserRoleIndex.USER,
})
export class SenderController extends NKCurdControllerBase<Sender> {
    constructor(private readonly senderService: SenderService) {
        const reflector = new Reflector();

        senderService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, SenderController);
        super(senderService);
    }
}
