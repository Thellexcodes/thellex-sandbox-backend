import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { CwalletsEntity } from './cwallet.entity';
import { Exclude } from 'class-transformer';
import { UserEntity } from '../../user.entity';
import { BaseEntity } from '../../base.entity';

@Entity({ name: 'cwallet_profiles' })
export class CwalletProfilesEntity extends BaseEntity {
  @Exclude()
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

@Exclude()
export class ICwalletProfilesDto extends CwalletProfilesEntity {}
