import { CustomRequest, CustomResponse } from '@/models/request.types';

export abstract class AbstractWalletManagerController {
  constructor() {}

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
  ): Promise<void>;
}
