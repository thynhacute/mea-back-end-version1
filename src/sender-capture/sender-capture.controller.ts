import { Reflector } from '@nestjs/core';
import { SenderCaptureService } from './sender-capture.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { SenderCapture } from './sender-capture.entity';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { ApiExcludeController } from '@nestjs/swagger';
@ApiExcludeController()
@NKAuthController({
    model: {
        type: SenderCapture,
    },
    query: {
        isShowDelete: false,
    },
    baseMethods: [
        RouterBaseMethodEnum.DELETE_ONE,
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_PAGING,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
})
export class SenderCaptureController extends NKCurdControllerBase<SenderCapture> {
    constructor(private readonly senderCaptureService: SenderCaptureService) {
        const reflector = new Reflector();

        senderCaptureService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, SenderCaptureController);
        super(senderCaptureService);
    }
}
