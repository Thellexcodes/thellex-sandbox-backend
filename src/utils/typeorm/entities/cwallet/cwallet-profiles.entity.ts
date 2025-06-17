import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CwalletsEntity, ICwalletEntity } from './cwallet.entity';
import { IUserEntity, UserEntity } from '../user.entity';
import { IBaseEntity } from '../base.entity';

@Entity({ name: 'cwallet_profiles' })
export class CwalletProfilesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.cWalletProfile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'state', type: 'varchar', default: 'active' })
  state: string;

  @Column({ name: 'wallet_set_id', type: 'uuid', unique: true })
  walletSetId: string;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => CwalletsEntity, (wallet) => wallet.profile, {
    cascade: true,
    eager: true,
  })
  wallets: CwalletsEntity[];
}

export interface ICwalletProfilesEntity extends IBaseEntity {
  user: IUserEntity;
  state: string;
  walletSetId: string;
  displayName: string | null;
  wallets: ICwalletEntity[];
}
