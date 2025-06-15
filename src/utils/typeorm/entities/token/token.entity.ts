import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CwalletsEntity } from '../cwallet/cwallet.entity';
import { QWalletsEntity } from '../qwallet/qwallets.entity';

@Entity({ name: 'tokens' })
export class TokenEntity extends BaseEntity {
  @Column({ name: 'chain_type', type: 'varchar' })
  chainType: 'EVM' | 'STELLAR';

  @Column({ name: 'symbol', type: 'varchar' })
  symbol: string;

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

  @Column({ type: 'varchar', nullable: true })
  network: string | null;

  // 💰 Wallet context
  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @Column({ name: 'wallet_type', type: 'varchar' })
  walletType: string;

  @Column({ name: 'balance', type: 'varchar', nullable: true })
  balance: string | null;

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
