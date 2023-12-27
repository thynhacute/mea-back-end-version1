import { Setting } from '../setting.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateSettingDto extends PickType(Setting, ['value', 'description'] as const) {}
