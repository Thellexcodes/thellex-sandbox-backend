import { ProcessedBuildEntity } from '@/utils/typeorm/entities/processed-build.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// src/modules/firebase/firebase-store.service.ts
@Injectable()
export class FirebaseStoreService {
  constructor(
    @InjectRepository(ProcessedBuildEntity)
    private readonly releaseRepo: Repository<ProcessedBuildEntity>,
  ) {}

  async setLatest(release: { name: string; releaseNotes?: string }) {
    const newRelease = this.releaseRepo.create(release);
    return await this.releaseRepo.save(newRelease);
  }

  async getLatest() {
    return await this.releaseRepo.findOne({
      order: { createdAt: 'DESC' },
    });
  }
}
