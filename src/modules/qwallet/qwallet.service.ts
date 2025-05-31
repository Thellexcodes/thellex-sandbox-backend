import { Injectable } from '@nestjs/common';
import { CreateQwalletDto } from './dto/create-qwallet.dto';
import { UpdateQwalletDto } from './dto/update-qwallet.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { QUIDAX_USERS_API_URL } from '@/utils/constants';

@Injectable()
export class QwalletService {
  constructor(private readonly configService: ConfigService) {}

  async create(createQwalletDto: CreateQwalletDto) {
    const options = {
      method: 'POST',
      url: QUIDAX_USERS_API_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.get<string>('QWALLET_SECRET_KEY')}`,
      },
      data: {
        email: createQwalletDto.email,
        first_name: createQwalletDto.firstName,
        last_name: createQwalletDto.lastName,
      },
    };

    try {
      const response = await axios.request(options);
      console.log('✅ Quidax user created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        '❌ Failed to create Quidax user:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }

  findAll() {
    return `This action returns all qwallet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qwallet`;
  }

  update(id: number, updateQwalletDto: UpdateQwalletDto) {
    return `This action updates a #${id} qwallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} qwallet`;
  }
}
