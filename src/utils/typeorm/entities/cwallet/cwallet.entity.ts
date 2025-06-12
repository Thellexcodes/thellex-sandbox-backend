import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CwalletProfilesEntity } from './cwallet-profiles.entity';

@Entity({ name: 'cwallets' })
export class CwalletsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CwalletProfilesEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: CwalletProfilesEntity;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar' })
  currency: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ name: 'total_payments', type: 'varchar', nullable: true })
  totalPayments: string | null;

  @Column({ type: 'varchar', nullable: true })
  balance: string | null;

  @Column({ name: 'default_network', type: 'varchar' })
  defaultNetwork: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'wallet_id', type: 'uuid', nullable: false })
  walletID: string;

  @Column({ type: 'varchar' })
  custodyType: string;

  @Column({ name: 'account_type', type: 'varchar' })
  accountType: string;

  @Column({ name: 'state', type: 'varchar', nullable: true })
  state: string | null;

  @Column({ name: 'sca_core', type: 'varchar', nullable: true })
  scaCore: string | null;
}

export interface ICwallet {
  id: string;
  profile: any;
  reference: string | null;
  currency: string;
  address: string;
  totalPayments: string | null;
  balance: string | null;
  defaultNetwork: string;
  createdAt: Date;
  updatedAt: Date;
  walletID: string;
  custodyType: string;
  accountType: string;
  state: string | null;
  scaCore: string | null;
}
