import { WalletBalanceSummaryResponseDto } from '../dto/get-balance-response.dto';
import { VersionedControllerV2 } from '@/modules/controller/base.controller';
import { WalletEndpoints } from '@/routes/wallet-endpoints';
import { AbstractWalletManagerController } from '../abstract/abstract.wallet-manager.controller';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { CustomRequest, CustomResponse } from '@/models/request.types';

@ApiTags('Wallet Manager V2')
@VersionedControllerV2(WalletEndpoints.MAIN)
export class WalletManagerController extends AbstractWalletManagerController {
  getBalance(
    req: CustomRequest,
    res: CustomResponse,
    query: { action?: string },
  ): Promise<WalletBalanceSummaryResponseDto> {
    throw new Error('Method not implemented.');
  }
}
