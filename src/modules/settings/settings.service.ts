import { Injectable, Logger } from '@nestjs/common';
import { UpdateStoreSettingsDto } from './dto/update-setting.dto';
import { UpdatePaymentSettingsDto } from './dto/payment-settings';
import { UpdateTaxSettingsDto } from './dto/tax-settings.dto';
import { UpdatePayoutSettingsDto } from './dto/payout-settings.dto';

//[x] handle erros with enums
@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor() {
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

  async updateBankAccount(userId: number, id: number) {
    // const existing = await this.bankAccountRepo.findOne({
    //   where: { userId },
    // });
    // if (!existing) throw new NotFoundException('Bank account not found');
    // return this.bankAccountRepo.save({ ...existing, ...dto });
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
