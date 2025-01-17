import { PartialType } from '@nestjs/swagger';
import { CreateHdwalletDto } from './create-hdwallet.dto';

export class UpdateHdwalletDto extends PartialType(CreateHdwalletDto) {}
