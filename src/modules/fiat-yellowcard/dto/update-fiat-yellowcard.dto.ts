import { PartialType } from '@nestjs/swagger';
import { CreateFiatYellowcardDto } from './create-fiat-yellowcard.dto';

export class UpdateFiatYellowcardDto extends PartialType(CreateFiatYellowcardDto) {}
