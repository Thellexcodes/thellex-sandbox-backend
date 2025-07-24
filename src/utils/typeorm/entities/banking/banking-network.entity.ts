import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from '../user.entity';
import { BankingNetworkProviderEnum } from '@/config/settings';
import { BaseEntity } from '../base.entity';

@Index(['provider', 'external_customer_id'])
@Entity('banking_networks')
export class BankingNetworkEntity extends BaseEntity {
  @Column({ enum: BankingNetworkProviderEnum, type: 'enum', nullable: false })
  provider: BankingNetworkProviderEnum;

  @Column()
  external_customer_id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ length: 2 })
  country: string;

  @Column()
  status: string;

  @Column()
  tier: number;

  @Column()
  external_created_at: string;

  @Column()
  external_updated_at: string;

  @OneToOne(() => UserEntity, (user) => user.bankingNetworks)
  @JoinColumn()
  user: UserEntity;
}
