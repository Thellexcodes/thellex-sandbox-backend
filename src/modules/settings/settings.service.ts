import { UserSettingEntity } from '@/utils/typeorm/entities/settings/user.settings.entity';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateStoreSettingsDto } from './dto/update-setting.dto';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import {
  BankAccountErrorEnum,
  SettingsErrorEnum,
} from '@/models/settings.types';
import {
  ICreateBankRequestAccountDto,
  UpdatePaymentSettingsDto,
} from './dto/payment-settings';
import { UpdateTaxSettingsDto } from './dto/tax-settings.dto';
import { UpdatePayoutSettingsDto } from './dto/payout-settings.dto';
import { v4 as uuidV4 } from 'uuid';
import { YellowCardService } from '../payments/yellowcard.service';
import { MapleradService } from '../payments/maplerad.service';
import { toUTCDate } from '@/utils/helpers';
import { UserService } from '../users/user.service';

//[x] handle erros with enums
@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(UserSettingEntity)
    private readonly settingsRepo: Repository<UserSettingEntity>,

    private readonly ycService: YellowCardService,
    private readonly malperadService: MapleradService,
    private readonly userService: UserService,
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
