import { BaseEntity } from '@/utils/typeorm/entities/base.entity';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'card_management' })
export class CardManagementEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.authn, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  transactionId: string;

  @Column()
  assetCode: string;

  @Column()
  assetIssuer: string;

  @Column()
  amount: string;
}
