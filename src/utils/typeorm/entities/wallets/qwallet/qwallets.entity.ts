import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  IQWalletProfileDto,
  QWalletProfileEntity,
} from './qwallet-profile.entity';
import { BaseEntity } from '../../base.entity';
import { ITokenDto, TokenEntity } from '../../token/token.entity';
import {
  SupportedBlockchainType,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/config/settings';
import { Exclude, Expose, Type } from 'class-transformer';

@Entity({ name: 'qwallets' })
export class QWalletsEntity extends BaseEntity {
  @ManyToOne(() => QWalletProfileEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: QWalletProfileEntity;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ name: 'is_crypto', type: 'boolean', nullable: true })
  isCrypto: boolean | null;

  @Column({ name: 'destination_tag', type: 'varchar', nullable: true })
  destinationTag: string | null;

  @Column({ name: 'total_payments', type: 'varchar', nullable: true })
  totalPayments: string | null;

  @Column({ type: 'enum', enum: WalletProviderEnum, nullable: false })
  walletProvider: WalletProviderEnum;

  @Column({
    name: 'wallet_type',
    enum: SupportedWalletTypes,
    nullable: false,
  })
  walletType: SupportedWalletTypes;

  @Column({
    name: 'default_network',
    type: 'enum',
    enum: SupportedBlockchainType,
    default: SupportedBlockchainType.BEP20,
  })
  defaultNetwork: SupportedBlockchainType;

  @Column({
    name: 'networks',
    type: 'simple-array',
  })
  networks: SupportedBlockchainType[];

  @OneToMany(() => TokenEntity, (token) => token.qwallet, { eager: true })
  tokens: TokenEntity[];
}

@Exclude()
export class IQWalletDto extends QWalletsEntity {}
