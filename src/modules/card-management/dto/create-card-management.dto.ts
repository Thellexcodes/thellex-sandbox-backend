import { UserEntity } from '@/utils/typeorm/entities/user.entity';

export class CreateCardManagementDto {
  user: UserEntity;
  signedTx: string;
  transactionId: string;
  assetCode: string;
  assetIssuer: string;
  amount: string;
}
