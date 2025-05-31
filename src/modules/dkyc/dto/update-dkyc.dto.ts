import { PartialType } from '@nestjs/swagger';
import { CreateDkycDto } from './create-dkyc.dto';

export class UpdateDkycDto extends PartialType(CreateDkycDto) {}
