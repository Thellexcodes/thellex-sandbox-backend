import { BaseEntity, IBaseEntity } from '@/utils/typeorm/entities/base.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'card_management' })
export class CardManagementEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.authn, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'transaction_id', type: 'varchar' })
  transactionId: string;

  @Column({ name: 'asset_code', type: 'varchar' })
  assetCode: string;

  @Column({ name: 'asset_issuer', type: 'varchar' })
  assetIssuer: string;

  @Column({ name: 'amount', type: 'varchar' })
  amount: string;
}

export interface ICardManagementEntity extends IBaseEntity {
  user: UserEntity;
  transactionId: string;
  assetCode: string;
  assetIssuer: string;
  amount: string;
}
