import { IUserEntity, UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { IQWalletEntity, QWalletsEntity } from './qwallets.entity';
import { BaseEntity, IBaseEntity } from '../base.entity';
import { WalletProviderEnum } from '@/config/settings';

@Entity({ name: 'qwallet_profiles' })
export class QWalletProfileEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.qWalletProfile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'qid', type: 'uuid', nullable: false, unique: true })
  qid: string;

  @Column({ name: 'q_sn', type: 'varchar', nullable: false, unique: true })
  qsn: string;

  @Column({ name: 'state', type: 'varchar', default: 'active' })
  state: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName: string;

  @Column({ name: 'reference', type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({ type: 'enum', enum: WalletProviderEnum })
  walletProvider: WalletProviderEnum;

  @OneToMany(() => QWalletsEntity, (wallet) => wallet.profile, {
    cascade: true,
    eager: true,
  })
  wallets: QWalletsEntity[];
}

export interface IQWalletProfileEntity extends IBaseEntity {
  user: IUserEntity;
  qid: string;
  qsn: string;
  state: string;
  firstName?: string | null;
  lastName?: string | null;
  reference?: string | null;
  displayName?: string | null;
  walletProvider: WalletProviderEnum;
  wallets: IQWalletEntity[];
}
