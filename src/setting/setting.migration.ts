import { SETTING_DOMAIN_KEYS, SETTING_NAME_KEYS } from './setting.constant';
import { Setting } from './setting.entity';
import { OnModuleInit } from '@nestjs/common';
import { NKConfig } from '../core';
import { NKGlobal } from '../core/common/NKGlobal';
import { genUUID } from '../core/util';

export class SettingMigration implements OnModuleInit {
    async onModuleInit() {
        Object.keys(SETTING_NAME_KEYS).forEach(async (key) => {
            const setting = await NKGlobal.entityManager.findOne(Setting, {
                name: SETTING_NAME_KEYS[key],
            });

            await NKGlobal.entityManager.save(Setting, {
                ...setting,
                id: genUUID(Setting.name, SETTING_NAME_KEYS[key]),
                name: SETTING_NAME_KEYS[key],
                domain: SETTING_DOMAIN_KEYS.SYSTEM,
                value: process.env[SETTING_NAME_KEYS[key]],
            });
        });

        Object.keys(NKConfig).forEach(async (key) => {
            const setting = await NKGlobal.entityManager.findOne(Setting, {
                name: key,
            });

            await NKGlobal.entityManager.save(Setting, {
                ...setting,
                id: genUUID(Setting.name, key),
                name: key,
                domain: SETTING_DOMAIN_KEYS.COMMON,
                value: NKConfig[key],
            });
        });
    }
}
