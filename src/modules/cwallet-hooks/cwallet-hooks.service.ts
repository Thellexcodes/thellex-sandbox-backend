import { Injectable } from '@nestjs/common';
import { CreateCwalletHookDto } from './dto/create-cwallet-hook.dto';
import { UpdateCwalletHookDto } from './dto/update-cwallet-hook.dto';

@Injectable()
export class CwalletHooksService {
  create(createCwalletHookDto: CreateCwalletHookDto) {
    return 'This action adds a new cwalletHook';
  }

  findAll() {
    return `This action returns all cwalletHooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cwalletHook`;
  }

  update(id: number, updateCwalletHookDto: UpdateCwalletHookDto) {
    return `This action updates a #${id} cwalletHook`;
  }

  remove(id: number) {
    return `This action removes a #${id} cwalletHook`;
  }
}
