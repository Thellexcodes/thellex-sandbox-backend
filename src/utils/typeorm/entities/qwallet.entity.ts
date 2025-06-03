import { QWallet } from '@/types/qwallet.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'qwallet' })
export class QwalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.qwallet, {
    nullable: false,
    cascade: true,
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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  wallets: QWallet[] | null;
}
