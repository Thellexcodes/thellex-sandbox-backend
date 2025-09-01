import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetaTesterEntity } from '@/v1/utils/typeorm/entities/beta.testers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BetaTesterEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
