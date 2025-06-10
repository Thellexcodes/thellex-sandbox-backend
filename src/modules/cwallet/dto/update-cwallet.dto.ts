import { PartialType } from '@nestjs/swagger';
import { CreateCwalletDto } from './create-cwallet.dto';

export class UpdateCwalletDto extends PartialType(CreateCwalletDto) {}
