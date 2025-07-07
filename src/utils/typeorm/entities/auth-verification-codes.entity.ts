import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { Exclude } from 'class-transformer';
import { AUTH_VERIFICATION_CODE_TTL } from '@/config/settings';

@Entity({ name: 'auth_verification_codes' })
export class AuthVerificationCodesEntity extends BaseEntity {
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.verificationCodes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: false, unique: true })
  code: number;

  @Column({ nullable: true, default: false })
  expired: boolean;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    nullable: false,
  })
  expires_at: Date;

  @BeforeInsert()
  setExpiresAt() {
    const now = new Date();
    this.expires_at = new Date(
      now.getTime() + AUTH_VERIFICATION_CODE_TTL * 1000,
    );
  }
}

@Exclude()
export class IAuthVerificationCodeDto extends AuthVerificationCodesEntity {
  @Exclude() user: UserEntity;
  @Exclude() code: number;
  @Exclude() expired: boolean;
  @Exclude() expiresAt: Date;
}
