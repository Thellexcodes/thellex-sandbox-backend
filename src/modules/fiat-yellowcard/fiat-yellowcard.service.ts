import { Injectable } from '@nestjs/common';
import { CreateFiatYellowcardDto } from './dto/create-fiat-yellowcard.dto';
import { UpdateFiatYellowcardDto } from './dto/update-fiat-yellowcard.dto';

@Injectable()
export class FiatYellowcardService {
  create(createFiatYellowcardDto: CreateFiatYellowcardDto) {
    return 'This action adds a new fiatYellowcard';
  }

  findAll() {
    return `This action returns all fiatYellowcard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fiatYellowcard`;
  }

  update(id: number, updateFiatYellowcardDto: UpdateFiatYellowcardDto) {
    return `This action updates a #${id} fiatYellowcard`;
  }

  remove(id: number) {
    return `This action removes a #${id} fiatYellowcard`;
  }
}
