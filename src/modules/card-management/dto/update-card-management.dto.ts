import { PartialType } from '@nestjs/swagger';
import { CreateCardManagementDto } from './create-card-management.dto';

export class UpdateCardManagementDto extends PartialType(CreateCardManagementDto) {}
