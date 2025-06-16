import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CwalletsEntity } from '../cwallet/cwallet.entity';
import { QWalletsEntity } from '../qwallet/qwallets.entity';
import {
  SupportedBlockchainType,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/config/settings';

@Entity({ name: 'tokens' })
export class TokenEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', nullable: true })
  name: string | null;

  // EVM specific
  @Column({ name: 'contract_address', type: 'varchar', nullable: true })
  contractAddress: string | null;

  // Stellar specific
  @Column({ name: 'asset_code', type: 'varchar', nullable: true })
  assetCode: string | null;

  @Column({ name: 'issuer', type: 'varchar', nullable: true })
  issuer: string | null;

  @Column({ name: 'decimals', type: 'int', default: 18 })
  decimals: number;

  @Column({
    type: 'simple-array',
    name: 'networks',
  })
  networks: SupportedBlockchainType[];

  @Column({ name: 'balance', type: 'varchar', nullable: false, default: '0' })
  balance: string | null;

  @Column({
    name: 'wallet_type',
    type: 'enum',
    enum: SupportedWalletTypes,
    nullable: false,
  })
  walletType: SupportedWalletTypes;

  @Column({ type: 'enum', enum: WalletProviderEnum, nullable: false })
  walletProvider: WalletProviderEnum;

  @ManyToOne(() => CwalletsEntity, (wallet) => wallet.tokens, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cwallet_id' })
  cwallet?: CwalletsEntity;

  @ManyToOne(() => QWalletsEntity, (wallet) => wallet.tokens, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'qwallet_id' })
  qwallet?: QWalletsEntity;
}

export interface ITokenEntity {
  name: string | null;
  contractAddress: string | null;
  assetCode: string | null;
  issuer: string | null;
  decimals: number;
  networks: SupportedBlockchainType[];
  balance: string | null;
  walletType: SupportedWalletTypes;
  walletProvider: WalletProviderEnum;
  cwallet?: CwalletsEntity | null;
  qwallet?: QWalletsEntity | null;
}
