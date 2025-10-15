import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { WalletBalanceSummaryV2ResponseDto } from '../dto/get-balance-response.dto';

export abstract class AbstractWalletManagerService<
  T = WalletBalanceSummaryV2ResponseDto,
> {
  abstract getBalance(user: UserEntity): Promise<T>;
}

export abstract class V2AbstractWalletManagerService extends AbstractWalletManagerService<WalletBalanceSummaryV2ResponseDto> {
  abstract override getBalance(
    user: UserEntity,
  ): Promise<WalletBalanceSummaryV2ResponseDto | any>;
}
