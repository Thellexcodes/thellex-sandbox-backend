import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@/middleware/guards/local.auth.guard';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { CreateBankAccountDto } from './dto/payment-settings';
import { responseHandler } from '@/utils/helpers';
import { VersionedController001 } from '../controller/base.controller';
import { YellowCardService } from '../payments/yellowcard.service';

@VersionedController001('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ======================== Store Settings ========================
  // @Get('store')
  // getStoreSettings(@Request() req) {
  //   return this.settingsService.getStoreSettings(req.user.id);
  // }

  // @Patch('store')
  // updateStoreSettings(@Request() req, @Body() dto: UpdateStoreSettingsDto) {
  //   return this.settingsService.updateStoreSettings(req.user.id, dto);
  // }

  // // ======================== Bank Account Settings ========================
  // @Get('bank-account')
  // getBankAccount(@Request() req) {
  //   return this.settingsService.getuserIdBankAccountSettings(req.user.id);
  // }

  @Post('bank-account/add')
  @UseGuards(AuthGuard)
  async addBankAccount(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Body() dto,
  ) {
    const userId = req.user.id;
    const result = await this.settingsService.addBankAccount(userId, dto);
    console.log(result);
    return responseHandler(result, res, req);
  }

  // @Patch('bank-account/:id')
  // updateBankAccount(
  //   @Request() req,
  //   @Param('id') id: string,
  //   @Body() dto: UpdateBankAccountDto,
  // ) {
  //   return this.settingsService.updateBankAccount(req.user.id, +id, dto);
  // }

  // @Delete('bank-account/:id')
  // removeBankAccount(@Request() req, @Param('id') id: string) {
  //   return this.settingsService.removeBankAccount(req.user.id, +id);
  // }

  // // ======================== Tax Settings ========================
  // @Get('tax')
  // getTaxSettings(@Request() req) {
  //   return this.settingsService.getTaxSettings(req.user.id);
  // }

  // @Patch('tax')
  // updateTaxSettings(@Request() req, @Body() dto: UpdateTaxSettingsDto) {
  //   return this.settingsService.updateTaxSettings(req.user.id, dto);
  // }

  // // ======================== Payout Settings ========================
  // @Get('payout')
  // getPayoutSettings(@Request() req) {
  //   return this.settingsService.getPayoutSettings(req.user.id);
  // }

  // @Patch('payout')
  // updatePayoutSettings(@Request() req, @Body() dto: UpdatePayoutSettingsDto) {
  //   return this.settingsService.updatePayoutSettings(req.user.id, dto);
  // }

  // // ======================== Payment Settings ========================
  // @Get('payment')
  // getPaymentSettings(@Request() req) {
  //   return this.settingsService.getPaymentSettings(req.user.id);
  // }

  // @Patch('payment')
  // updatePaymentSettings(@Request() req, @Body() dto: UpdatePaymentSettingsDto) {
  //   return this.settingsService.updatePaymentSettings(req.user.id, dto);
  // }

  // // ======================== Notification Settings ========================
  // @Get('notifications')
  // getNotificationSettings(@Request() req) {
  //   return this.settingsService.getNotificationSettings(req.user.id);
  // }

  // @Patch('notifications')
  // updateNotificationSettings(
  //   @Request() req,
  //   @Body() dto: UpdateNotificationSettingsDto,
  // ) {
  //   return this.settingsService.updateNotificationSettings(req.user.id, dto);
  // }

  // // ======================== Appearance Settings ========================
  // @Get('appearance')
  // getAppearanceSettings(@Request() req) {
  //   return this.settingsService.getAppearanceSettings(req.user.id);
  // }

  // @Patch('appearance')
  // updateAppearanceSettings(
  //   @Request() req,
  //   @Body() dto: UpdateAppearanceSettingsDto,
  // ) {
  //   return this.settingsService.updateAppearanceSettings(req.user.id, dto);
  // }

  // // ======================== User Preferences ========================
  // @Get('preferences')
  // getUserPreferences(@Request() req) {
  //   return this.settingsService.getUserPreferences(req.user.id);
  // }

  // @Patch('preferences')
  // updateUserPreferences(@Request() req, @Body() dto: UpdateUserPreferencesDto) {
  //   return this.settingsService.updateUserPreferences(req.user.id, dto);
  // }
}
