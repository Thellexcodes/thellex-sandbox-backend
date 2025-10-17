import { BaseEntity } from '@/utils/typeorm/entities/base.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user/user.entity';

@Entity({ name: 'card_management' })
export class CardManagementEntity extends BaseEntity {
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.auth, { nullable: false })
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

@Exclude()
export class ICardManagementDto extends CardManagementEntity {}
