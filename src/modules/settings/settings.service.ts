import { BankAccountEntity } from '@/utils/typeorm/entities/settings/bank-account.entity';
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

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(UserSettingEntity)
    private readonly settingsRepo: Repository<UserSettingEntity>,

    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepo: Repository<BankAccountEntity>,
    private readonly ycService: YellowCardService,
    private readonly malperadService: MapleradService,
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

  async addBankAccount(
    userId: string,
    dto: ICreateBankRequestAccountDto,
  ): Promise<BankAccountEntity> {
    try {
      const existing = await this.bankAccountRepo.findOne({
        where: { user: { id: userId }, accountNumber: dto.accountNumber },
      });

      if (existing) {
        throw new CustomHttpException('', HttpStatus.FORBIDDEN);
      }

      const bankInfo = await this.malperadService.resolveInstitutionAccount({
        account_number: dto.accountNumber,
        bank_code: dto.bankCode,
      });

      const isFirstAccount =
        (await this.bankAccountRepo.count({
          where: { user: { id: userId } },
        })) === 0;

      const newBankRecord = this.bankAccountRepo.create({
        ...dto,
        isPrimary: isFirstAccount,
        user: { id: userId },
        external_customer_id: uuidV4(),
        accountName: bankInfo.account_name,
        external_createdAt: toUTCDate(new Date().toString()),
      });

      return await this.bankAccountRepo.save(newBankRecord);
    } catch (err) {
      this.logger.error(err);
      throw new Error('Failed to add bank account');
    }
  }

  async updateBankAccount(userId: number, id: number) {
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
