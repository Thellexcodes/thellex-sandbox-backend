import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { FiatWalletEntity } from './fiatwallet.entity';
import { BaseEntity } from '../../base.entity';
import { UserEntity } from '../../user/user.entity';

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
