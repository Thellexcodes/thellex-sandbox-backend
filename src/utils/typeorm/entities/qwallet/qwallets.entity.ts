import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { QWalletProfileEntity } from './qwallet-profile.entity';
import { BaseEntity } from '../base.entity';
import { TokenEntity } from '../token/token.entity';

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
  currency: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ name: 'is_crypto', type: 'boolean', nullable: true })
  isCrypto: boolean | null;

  @Column({ name: 'destination_tag', type: 'varchar', nullable: true })
  destinationTag: string | null;

  @Column({ name: 'total_payments', type: 'varchar', nullable: true })
  totalPayments: string | null;

  @Column({ name: 'default_network', type: 'varchar' })
  defaultNetwork: string;

  @OneToMany(() => TokenEntity, (token) => token.qwallet)
  tokens: TokenEntity[];
}
