import { PartialType } from '@nestjs/swagger';
import { CreateSwapDto } from './create-swap.dto';

export class UpdateSwapDto extends PartialType(CreateSwapDto) {}
