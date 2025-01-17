import { Injectable } from '@nestjs/common';
import { CreateHdwalletDto } from './dto/create-hdwallet.dto';
import { UpdateHdwalletDto } from './dto/update-hdwallet.dto';

@Injectable()
export class HdwalletService {
  create(createHdwalletDto: CreateHdwalletDto) {
    return 'This action adds a new hdwallet';
  }

  findAll() {
    return `This action returns all hdwallet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hdwallet`;
  }

  update(id: number, updateHdwalletDto: UpdateHdwalletDto) {
    return `This action updates a #${id} hdwallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} hdwallet`;
  }
}
