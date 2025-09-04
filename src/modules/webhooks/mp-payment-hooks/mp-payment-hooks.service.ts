import { Injectable, Logger } from '@nestjs/common';
import { UpdateMpPaymentHookDto } from './dto/update-mp-payment-hook.dto';

@Injectable()
export class MpPaymentHooksService {
  private readonly logger = new Logger(MpPaymentHooksService.name);

  create(createMpPaymentHookDto) {
    console.log({ createMpPaymentHookDto }, MpPaymentHooksService.name);

    //      {
    // [1]   createMpPaymentHookDto: {
    // [1]     created_at: '2025-08-25 21:38:39.734689 +0000 UTC',
    // [1]     event: 'transfer.successful',
    // [1]     id: 'e405c61d-ecff-4d7d-8564-038411401160',
    // [1]     reference: null,
    // [1]     status: 'SUCCESS',
    // [1]     updated_at: '2025-08-25 21:39:16.038069089 +0000 UTC'
    // [1]   }
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
