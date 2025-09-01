import { Injectable } from '@nestjs/common';
import { CreateBridgeDto } from './dto/create-bridge.dto';
import { UpdateBridgeDto } from './dto/update-bridge.dto';

@Injectable()
export class BridgeService {
  create(createBridgeDto: CreateBridgeDto) {
    return 'This action adds a new bridge';
  }

  findAll() {
    return `This action returns all bridge`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bridge`;
  }

  update(id: number, updateBridgeDto: UpdateBridgeDto) {
    return `This action updates a #${id} bridge`;
  }

  remove(id: number) {
    return `This action removes a #${id} bridge`;
  }
}
