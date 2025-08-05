import { PartialType } from '@nestjs/swagger';
import { CreateMpPaymentHookDto } from './create-mp-payment-hook.dto';

export class UpdateMpPaymentHookDto extends PartialType(CreateMpPaymentHookDto) {}
