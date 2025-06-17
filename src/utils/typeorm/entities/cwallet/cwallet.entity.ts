import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CwalletProfilesEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: CwalletProfilesEntity;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ name: 'total_payments', type: 'varchar', nullable: true })
  totalPayments: string | null;

  @Column({
    name: 'default_network',
    type: 'enum',
    enum: SupportedBlockchainType,
    default:
      process.env.NODE_ENV === ENV_TESTNET
        ? SupportedBlockchainType.MATIC_AMOY
        : SupportedBlockchainType.MATIC,
  })
  defaultNetwork: SupportedBlockchainType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'wallet_id', type: 'uuid', nullable: false })
  walletID: string;

  @Column({ type: 'varchar' })
  custodyType: string;

  @Column({ name: 'account_type', type: 'varchar' })
  accountType: string;

  @Column({ name: 'state', type: 'varchar', nullable: true })
  state: string | null;

  @Column({ name: 'sca_core', type: 'varchar', nullable: true })
  scaCore: string | null;

  @Column({
    name: 'networks',
    type: 'simple-array',
  })
  networks: SupportedBlockchainType[];

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
