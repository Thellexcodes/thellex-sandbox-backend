import { Injectable, Logger } from '@nestjs/common';
import { UpdateMpPaymentHookDto } from './dto/update-mp-payment-hook.dto';

@Injectable()
export class MpPaymentHooksService {
  private readonly logger = new Logger(MpPaymentHooksService.name);

  create(createMpPaymentHookDto) {
    this.logger.log(createMpPaymentHookDto);
  }

  findAll() {
    return `This action returns all mpPaymentHooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mpPaymentHook`;
  }

  update(id: number, updateMpPaymentHookDto: UpdateMpPaymentHookDto) {
    return `This action updates a #${id} mpPaymentHook`;
  }

  remove(id: number) {
    return `This action removes a #${id} mpPaymentHook`;
  }
}
