import { Injectable } from '@nestjs/common';
import { CreateCardManagementDto } from './dto/create-card-management.dto';
import { UpdateCardManagementDto } from './dto/update-card-management.dto';
import { CardManagementEntity } from './entities/card-management.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CardManagementService {
  constructor(
    @InjectRepository(CardManagementEntity)
    private readonly cardManagementRepository: Repository<CardManagementEntity>,
  ) {}

  async create(createCardManagementDto: CreateCardManagementDto) {
    try {
      const newCard = this.cardManagementRepository.create(
        createCardManagementDto,
      );

      return await this.cardManagementRepository.save(newCard);
    } catch (err) {}
  }

  findAll() {
    return [1, 2];
  }

  findOne(id: number) {
    return `This action returns a #${id} cardManagement`;
  }

  update(id: number, updateCardManagementDto: UpdateCardManagementDto) {
    return `This action updates a #${id} cardManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} cardManagement`;
  }
}
