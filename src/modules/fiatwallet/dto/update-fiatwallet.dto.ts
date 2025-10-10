import { PartialType } from '@nestjs/swagger';
import { CreateFiatwalletDto } from './create-fiatwallet.dto';

export class UpdateFiatwalletDto extends PartialType(CreateFiatwalletDto) {}
