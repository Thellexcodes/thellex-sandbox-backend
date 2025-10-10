import { Injectable } from '@nestjs/common';
import { CreateFiatwalletDto } from './dto/create-fiatwallet.dto';
import { UpdateFiatwalletDto } from './dto/update-fiatwallet.dto';

@Injectable()
export class FiatwalletService {
  create(createFiatwalletDto: CreateFiatwalletDto) {
    return 'This action adds a new fiatwallet';
  }

  findAll() {
    return `This action returns all fiatwallet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fiatwallet`;
  }

  update(id: number, updateFiatwalletDto: UpdateFiatwalletDto) {
    return `This action updates a #${id} fiatwallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} fiatwallet`;
  }
}
