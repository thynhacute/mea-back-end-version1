import { Injectable } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { monoEnum } from 'mono-utils-core';
import { NKLOGGER_NS, nkLogger } from '../../../core/logger';
import { NKConfig } from '../../NKConfig';
import { constant } from '../../constant';

@Injectable()
export class EmailService {
    constructor(private readonly mailService: MailService) {}

    private sendMail(receiver: string, subject: string, content: string) {
        const mail: MailDataRequired = {
            to: receiver,
            from: NKConfig.SENDGRID_SENDER,
            subject: subject,
            html: `<div>${content}</div>`,
            mailSettings: {
                sandboxMode: {
                    enable: NKConfig.NODE_ENV !== monoEnum.NODE_ENV_MODE.PRODUCTION,
                },
            },
        };

        return this.mailService
            .send(mail)
            .then(() => {
                nkLogger(NKLOGGER_NS.SERVICE_MAIL, `Send mail to ${receiver} successfully`);
                return true;
            })
            .catch((error) => {
                nkLogger(NKLOGGER_NS.APP_ERROR, error.response.body);
                return false;
            });
    }

    async sendEmailForVerify(receiver: string, otp: string) {
        return await this.sendMail(
            receiver,
            'VERIFY EMAIL',
            `
                                                <div>
                                            
                                                </div>
        `,
        );
    }
}
