import { Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { Setting } from './setting.entity';
import { NKService } from '../core/decorators/NKService.decorator';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKLOGGER_NS } from '../core/logger';

@NKService()
export class SettingService extends NKServiceBase<Setting> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(Setting));
    }

    async update(id: string, data: UpdateSettingDto) {
        const setting = await NKGlobal.entityManager.findOne(Setting, {
            id,
        });
        if (!setting) {
            return;
        }
        setting.value = data.value;
        setting.description = data.description;
        NKGlobal.logger(NKLOGGER_NS.APP_INFO, `Update setting ${setting.name} to ${setting.value}`);
        return await NKGlobal.entityManager.save(setting);
    }
}
