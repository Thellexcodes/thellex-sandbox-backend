import { Injectable } from '@nestjs/common';
import { CreateFirebaseDto } from './dto/create-firebase.dto';
import { UpdateFirebaseDto } from './dto/update-firebase.dto';

@Injectable()
export class FirebaseService {
  create(createFirebaseDto: CreateFirebaseDto) {
    return 'This action adds a new firebase';
  }

  findAll() {
    return `This action returns all firebase`;
  }

  findOne(id: number) {
    return `This action returns a #${id} firebase`;
  }

  update(id: number, updateFirebaseDto: UpdateFirebaseDto) {
    return `This action updates a #${id} firebase`;
  }

  remove(id: number) {
    return `This action removes a #${id} firebase`;
  }
}
