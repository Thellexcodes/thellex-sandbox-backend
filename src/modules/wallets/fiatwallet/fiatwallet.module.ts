import { Module } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { FiatwalletController } from './fiatwallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiatWalletProfileEntity } from '@/utils/typeorm/entities/wallets/fiatwallet/fiatwalletprofile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FiatWalletProfileEntity])],
  controllers: [FiatwalletController],
  providers: [FiatwalletService],
})
export class FiatwalletModule {}
