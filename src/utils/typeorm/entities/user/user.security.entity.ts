import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_security' })
export class UserSecurityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'boolean', default: false })
  hasPin: boolean;

  @Column({ type: 'varchar', nullable: true })
  pinHash: string;

  @Column({ name: 'is_biometric_enabled', type: 'boolean', default: false })
  isBiometricEnabled: boolean;

  @Column({ name: 'last_used_auth', type: 'varchar', nullable: true })
  lastUsedAuth: 'PIN' | 'BIOMETRIC' | null;
}
