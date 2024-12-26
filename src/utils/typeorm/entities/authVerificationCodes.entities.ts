import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'AuthVerificationCodes' })
export class AuthVerificationCodesEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.verificationCodes, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: false, unique: true })
  code: number;
}
