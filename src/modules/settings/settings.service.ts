import { BankAccountEntity } from '@/utils/typeorm/entities/settings/bank-account.entity';
import { UserSettingEntity } from '@/utils/typeorm/entities/settings/user.settings.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateStoreSettingsDto } from './dto/update-setting.dto';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import {
  BankAccountErrorEnum,
  SettingsErrorEnum,
} from '@/models/settings.types';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  UpdatePaymentSettingsDto,
} from './dto/payment-settings';
import { UpdateTaxSettingsDto } from './dto/tax-settings.dto';
import { UpdatePayoutSettingsDto } from './dto/payout-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettingEntity)
    private readonly settingsRepo: Repository<UserSettingEntity>,

    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepo: Repository<BankAccountEntity>,
  ) {
    // Inject other repositories as needed (e.g., TaxSettingEntity, PayoutSettingEntity)
  }

  // ------------------- Store Settings -------------------
  async getStoreSettings(userId: number) {
    // return this.settingsRepo.findOne({ where: { userId } });
  }

  async updateStoreSettings(
    userId: number,
    dto: Partial<UpdateStoreSettingsDto>,
  ) {
    // const existing = await this.settingsRepo.findOne({ where: { userId } });
    // if (!existing)
    //   throw new CustomHttpException(
    //     SettingsErrorEnum.STORE_SETTINGS_NOT_FOUND,
    //     HttpStatus.NOT_FOUND,
    //   );
    // return this.settingsRepo.save({ ...existing, ...dto });
  }

  // ------------------- Bank Account Settings -------------------
  async getBankAccounts(userId: number) {
    // return this.bankAccountRepo.find({ where: { userId } });
  }

  async addBankAccount(userId: string, dto: CreateBankAccountDto) {
    const newBankRecord = this.bankAccountRepo.create({
      ...dto,
      user: { id: userId },
    });
    return this.bankAccountRepo.save(newBankRecord);
  }

  async updateBankAccount(
    userId: number,
    id: number,
    dto: UpdateBankAccountDto,
  ) {
    // const existing = await this.bankAccountRepo.findOne({
    //   where: { userId },
    // });
    // if (!existing) throw new NotFoundException('Bank account not found');
    // return this.bankAccountRepo.save({ ...existing, ...dto });
  }

  async deleteBankAccount(userId: string, accountName: string) {
    const account = await this.bankAccountRepo.findOne({
      where: { accountName, user: { id: userId } },
    });
    if (!account)
      throw new CustomHttpException(
        BankAccountErrorEnum.BANK_ACCOUNT_NOT_FOUND,
      );
    return this.bankAccountRepo.remove(account);
  }

  // ------------------- Tax Settings -------------------
  async getTaxSettings(userId: number) {
    // Assume tax settings are stored in same or a separate entity
    // return this.settingsRepo.findOne({ where: { userId } });
  }

  async updateTaxSettings(userId: number, dto: UpdateTaxSettingsDto) {
    // const existing = await this.settingsRepo.findOne({ where: { userId } });
    // if (!existing) throw new NotFoundException('Tax settings not found');
    // return this.settingsRepo.save({ ...existing, ...dto });
  }

  // ------------------- Payout Settings -------------------
  async getPayoutSettings(userId: number) {
    // return this.settingsRepo.findOne({ where: { userId } });
  }

  async updatePayoutSettings(userId: number, dto: UpdatePayoutSettingsDto) {
    // const existing = await this.settingsRepo.findOne({ where: { userId } });
    // if (!existing) throw new NotFoundException('Payout settings not found');
    // return this.settingsRepo.save({ ...existing, ...dto });
  }

  // ------------------- Payment Settings -------------------
  async getPaymentSettings(userId: number) {
    // return this.settingsRepo.findOne({ where: { userId } });
  }

  async updatePaymentSettings(userId: number, dto: UpdatePaymentSettingsDto) {
    // const existing = await this.settingsRepo.findOne({ where: { userId } });
    // if (!existing) throw new NotFoundException('Payment settings not found');
    // return this.settingsRepo.save({ ...existing, ...dto });
  }

  //[x] Add other config logic as needed (notifications, appearance, user preferences)
}
