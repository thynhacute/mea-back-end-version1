import { Module } from '@nestjs/common';
import { MailService } from '@sendgrid/mail';
import { NKConfig } from '../..';
import { EmailService } from './email.service';

@Module({
    providers: [
        {
            provide: MailService,
            useFactory: () => {
                const mailService = new MailService();
                mailService.setApiKey(NKConfig.SENDGRID_KEY);
                return mailService;
            },
        },
        EmailService,
    ],
    exports: [EmailService],
})
export class EmailModule {}
