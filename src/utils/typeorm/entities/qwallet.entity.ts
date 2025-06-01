import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
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

  @Column({ name: 'quidax_id', type: 'uuid', nullable: false, unique: true })
  quidaxId: string;

  @Column({ name: 'quidax_sn', type: 'varchar', nullable: false, unique: true })
  quidaxSn: string;

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

  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;
}

// 31a6aa62-cbe8-4bc4-a37e-058e3e56c7d6
