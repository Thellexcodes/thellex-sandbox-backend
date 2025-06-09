import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QWalletProfileEntity } from './qwallet-profile.entity';

@Entity({ name: 'qwallets' })
export class QWalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'varchar', nullable: true })
  balance: string | null;

  @Column({ name: 'default_network', type: 'varchar' })
  defaultNetwork: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
