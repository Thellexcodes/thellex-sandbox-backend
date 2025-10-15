import { Body, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { FiatwalletService } from './fiatwallet.service';
import { AbstractFiatwalletController } from './abstracts/abstract.fiatwalletController';
import { CustomRequest, CustomResponse } from '@/models/request.types';
import { VersionedControllerV2 } from '@/modules/controller/base.controller';
import { FiatEndpoints } from '@/routes/fiat-endpoints';
import { responseHandler } from '@/utils/helpers';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientAuthGuard } from '@/middleware/guards/client-auth.guard';
import { VerificationAuthGuard } from '@/middleware/guards/local.auth.guard';
import { CreateFiatWalletDto } from './dto/fiatwallet.dto';
import {
  CreditSimulationDto,
  VfdAccountEnquiryDto,
  VfdBeneficiaryEnquiryDto,
} from '@/models/payments/vfd.types';

@ApiTags('Fiat Wallet V2')
@ApiBearerAuth('access-token')
@UseGuards(ClientAuthGuard)
@VersionedControllerV2(FiatEndpoints.MAIN)
export class FiatwalletController extends AbstractFiatwalletController {
  constructor(readonly fiatwalletService: FiatwalletService) {
    super(fiatwalletService);
  }

  /**
   * @description Creates a new fiat wallet profile for the authenticated user.
   * A default wallet may be automatically attached upon profile creation.
   */
  @Post(FiatEndpoints.CREATE_PROFILE)
  @UseGuards(VerificationAuthGuard)
  async createFiatWalletProfile(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = await this.fiatwalletService.createProfileWithWallet(
      user.id,
    );
    responseHandler(result, res, req);
  }

  /**
   * @description Creates a new fiat wallet for an existing user profile.
   * Requires BVN and date of birth for verification.
   */
  @Post(FiatEndpoints.CREATE_WALLET)
  @UseGuards(VerificationAuthGuard)
  async createFiatWallet(
    @Body() body: CreateFiatWalletDto,
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = await this.fiatwalletService.addWalletToProfileWithBvn(
      user.id,
      body.bvn,
      body.dob,
    );
    responseHandler(result, res, req);
  }

  /**
   * @description Retrieves the authenticated user's fiat wallet profile.
   * Includes details about linked fiat wallets and account info.
   */
  @Post(FiatEndpoints.GET_PROFILE)
  async getUserFiatWalletProfile(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    const user = req.user;
    const result = await this.fiatwalletService.getUserFiatWalletProfile(
      user.id,
    );
    responseHandler(result, res, req);
  }

  /**
   * @description Retrieves a user’s fiat wallet(s) based on their country.
   * (To be implemented)
   */
  @Post(FiatEndpoints.GET_BY_COUNTRY)
  async getUserFiatWalletByCountry(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: any,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * @description Retrieves a user’s fiat wallet by currency ticker (e.g., USD, NGN).
   * (To be implemented)
   */
  @Post(FiatEndpoints.GET_BY_TICKER)
  async getUserFiatWalletByTicker(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: any,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * @description Retrieves all fiat wallets in the system.
   * (To be implemented)
   */
  @Post(FiatEndpoints.GET_ALL)
  async getAllFiatWallets(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * @description Performs an account enquiry using an account number.
   * Used to fetch account details before initiating a transfer.
   */
  @Get(FiatEndpoints.ACCOUNT_ENQUIRY)
  async accountEnquiry(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: VfdAccountEnquiryDto,
  ): Promise<void> {
    const user = req.user;
    const result = await this.fiatwalletService.accountEnquiry(
      user.id,
      query.accountNumber,
    );
    responseHandler(result, res, req);
  }

  /**
   * @description Verifies beneficiary information before a transfer is made.
   * Typically requires account number, bank code, and transfer type.
   * (To be implemented)
   */
  @Get(FiatEndpoints.BENEFICIARY_ENQUIRY)
  async beneficiaryEnquiry(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Query() query: VfdBeneficiaryEnquiryDto,
  ): Promise<void> {
    const result = await this.fiatwalletService.beneficiaryEnquiry(query);
  }

  /**
   * @description Initiates a fund transfer from one wallet/account to another.
   * (To be implemented)
   */
  @Post(FiatEndpoints.INITIATE_TRANSFER)
  async initiateTransfer(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * @description Simulates a credit transaction (for testing or internal use).
   * Mocks a deposit or incoming transfer event into a fiat wallet.
   */
  @Post('simulate-credit')
  async simulateCredit(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse,
    @Body() dto: CreditSimulationDto,
  ): Promise<void> {
    const result = await this.fiatwalletService.simulateCredit(dto);
    responseHandler(result, res, req);
  }
}
