import { Controller } from '@nestjs/common';
import { RepairReplaceItemService } from './repair-replace-item.service';

@Controller('repair-replace-item')
export class RepairReplaceItemController {
    constructor(private readonly repairReplaceItemService: RepairReplaceItemService) {}
}
