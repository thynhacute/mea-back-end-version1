import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { UserTokenService } from '../../../user-token/user-token.service';
import { CRON_NAME } from '../cron.constant';
import { Job } from 'bull';
import { NKGlobal } from '../../../core/common/NKGlobal';
import { NKLOGGER_NS } from '../../../core/logger';

@Processor(CRON_NAME.USER_TOKEN)
export class UserTokenCronProcessor {
    constructor(private readonly userTokenService: UserTokenService) {}

    @Process()
    processQueue(job: Job) {
        NKGlobal.logger(NKLOGGER_NS.APP_CRON, `UserTokenCronProcessor processQueue: ${job.id}`);
        return this.userTokenService.clearExpiredToken();
    }
}
