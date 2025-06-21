import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity, IBaseEntity } from '../base.entity';
import { CwalletsEntity, ICwalletEntity } from '../cwallet/cwallet.entity';
import { IQWalletEntity, QWalletsEntity } from '../qwallet/qwallets.entity';
import {
  SupportedBlockchainType,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/config/settings';

@Entity({ name: 'tokens' })
export class TokenEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', nullable: true })
  name: string | null;

  @Column({ name: 'asset_code', type: 'varchar', nullable: true })
  assetCode: string | null;

  @Column({ name: 'issuer', type: 'varchar', nullable: true })
  issuer: string | null;

  @Column({ name: 'decimals', type: 'int', default: 18 })
  decimals: number;

  @Column({ name: 'balance', type: 'varchar', nullable: false, default: '0' })
  balance: string | null;

  @Column({
    name: 'wallet_type',
    type: 'enum',
    enum: SupportedWalletTypes,
    nullable: false,
  })
  walletType: SupportedWalletTypes;

  @Column({
    name: 'wallet_provider',
    type: 'enum',
    enum: WalletProviderEnum,
    nullable: false,
  })
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

export interface ITokenEntity extends IBaseEntity {
  name: string | null;
  contractAddress: string | null;
  assetCode: string | null;
  issuer: string | null;
  decimals: number;
  networks: SupportedBlockchainType[];
  balance: string | null;
  walletType: SupportedWalletTypes;
  walletProvider: WalletProviderEnum;
  cwallet?: ICwalletEntity | null;
  qwallet?: IQWalletEntity | null;
}
