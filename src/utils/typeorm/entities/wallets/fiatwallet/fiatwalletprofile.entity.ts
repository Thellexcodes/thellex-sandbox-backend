import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UserEntity } from '../../user.entity';
import { FiatWalletEntity } from './fiatwallet.entity';
import { BaseEntity } from '../../base.entity';

@Entity('fiat_wallet_profiles')
export class FiatWalletProfileEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.fiatWalletProfile)
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => FiatWalletEntity, (wallet) => wallet.profile, {
    cascade: true,
  })
  wallets: FiatWalletEntity[];
}
