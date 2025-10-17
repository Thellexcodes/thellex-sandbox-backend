import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Exclude } from 'class-transformer';
import { UserEntity } from '../user/user.entity';

@Entity('payout_settings')
export class PayoutSettingEntity extends BaseEntity {
  @Exclude()
  @OneToOne(() => UserEntity, (user) => user.payoutSettings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'payout_frequency', nullable: true })
  payoutFrequency?: string;

  @Column({ name: 'payout_day', nullable: true })
  payoutDay?: string;

  @Column({ name: 'notify_on_payout', default: true })
  notifyOnPayout: boolean;
}

export class IPayoutSettingDto extends PayoutSettingEntity {}
