import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { NKLOGGER_NS, nkLogger } from '../../../core/logger';
import { NKConfig, constant } from '../../../core';
//----- Service

@Injectable()
export class FirebaseService {
    async sendNotification(to: string, priority: string, title: string, body: string, data: any) {
        if (!to) {
            return false;
        }
        try {
            await axios.post(
                'https://fcm.googleapis.com/fcm/send',
                {
                    to,
                    priority,
                    notification: {
                        title,
                        body,
                    },
                    data: {
                        ...data,
                        badge: 1,
                    },
                },
                {
                    headers: {
                        Authorization: `key=${NKConfig.FIREBASE_SERVER_KEY}`,
                    },
                },
            );
            nkLogger(NKLOGGER_NS.SERVICE_FIREBASE, `Send notification to ${to} successfully`);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
