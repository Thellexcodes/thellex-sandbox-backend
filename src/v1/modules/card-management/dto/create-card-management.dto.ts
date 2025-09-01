import { UserEntity } from '@/v1/utils/typeorm/entities/user.entity';

export class CreateCardManagementDto {
  user: UserEntity;
  signedTx: string;
  transactionId: string;
  assetCode: string;
  assetIssuer: string;
  amount: string;
}
