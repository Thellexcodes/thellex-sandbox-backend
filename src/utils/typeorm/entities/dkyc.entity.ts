import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'dkyc' })
export class DKycEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.dkyc, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'boolean', default: false })
  ninVerified: boolean;

  @Column({ type: 'boolean', default: false })
  bvnVerified: boolean;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;
}
