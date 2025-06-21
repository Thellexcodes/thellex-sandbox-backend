import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import {
  CwalletProfilesEntity,
  ICwalletProfilesEntity,
} from './cwallet-profiles.entity';
import { ITokenEntity, TokenEntity } from '../token/token.entity';
import { BaseEntity, IBaseEntity } from '../base.entity';
import { SupportedBlockchainType } from '@/config/settings';
import { ENV_TESTNET } from '@/constants/env';

@Entity({ name: 'cwallets' })
export class CwalletsEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, name: 'reference' })
  reference: string | null;

  @Column({ type: 'varchar', name: 'currency' })
  currency: string;

  @Column({ type: 'varchar', name: 'address' })
  address: string;

  @Column({ type: 'varchar', nullable: true, name: 'total_payments' })
  totalPayments: string | null;

  @Column({
    type: 'enum',
    enum: SupportedBlockchainType,
    name: 'default_network',
    default:
      process.env.NODE_ENV === ENV_TESTNET
        ? SupportedBlockchainType.MATIC_AMOY
        : SupportedBlockchainType.MATIC,
  })
  defaultNetwork: SupportedBlockchainType;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: false, name: 'wallet_id' })
  walletID: string;

  @Column({ type: 'varchar', name: 'custody_type' })
  custodyType: string;

  @Column({ type: 'varchar', name: 'account_type' })
  accountType: string;

  @Column({ type: 'varchar', nullable: true, name: 'state' })
  state: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'sca_core' })
  scaCore: string | null;

  @Column({
    type: 'simple-array',
    name: 'networks',
  })
  networks: SupportedBlockchainType[];

  @ManyToOne(() => CwalletProfilesEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: CwalletProfilesEntity;

  @OneToMany(() => TokenEntity, (token) => token.cwallet, { eager: true })
  tokens: TokenEntity[];
}

export interface ICwalletEntity extends IBaseEntity {
  profile: ICwalletProfilesEntity;
  reference: string | null;
  currency: string;
  address: string;
  totalPayments: string | null;
  defaultNetwork: SupportedBlockchainType;
  createdAt: Date;
  updatedAt: Date;
  walletID: string;
  custodyType: string;
  accountType: string;
  state: string | null;
  scaCore: string | null;
  tokens?: ITokenEntity[];
}
