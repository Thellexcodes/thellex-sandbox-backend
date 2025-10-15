import { CustomRequest, CustomResponse } from '@/models/request.types';
import { QwalletService } from '../../qwallet/qwallet.service';
import { WalletManagerService } from '../v1/wallet-manager.service';
import { AbstractWalletManagerService } from './abstract.wallet-manager.service';
import { WalletBalanceSummaryResponseDto } from '../dto/get-balance-response.dto';

export abstract class AbstractWalletManagerController {
  protected constructor(
    protected readonly walletManagerService: WalletManagerService,
    protected readonly qwalletService: QwalletService,
  ) {}

  /**
   * Get overall wallet balance across all assets
   * Optionally activates QWallet if user has none and `action=activate`
   *
   * @param req CustomRequest - request containing authenticated user
   * @param res CustomResponse - custom response handler
   * @param query optional query parameter { action?: string }
   */
  abstract getBalance(
    req: CustomRequest,
    res: CustomResponse,
    query: { action?: string },
  ): Promise<WalletBalanceSummaryResponseDto>;
}
