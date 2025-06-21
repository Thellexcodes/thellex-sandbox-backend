import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseDto, BaseEntity } from '../base.entity';
import { IUserDto, UserEntity } from '../user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

@Entity('payout_settings')
export class PayoutSettingEntity extends BaseEntity {
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

export class IPayoutSettingDto extends BaseDto {
  @ApiProperty({ type: () => IUserDto })
  @Expose()
  @Type(() => IUserDto)
  user: IUserDto;

  @ApiPropertyOptional()
  @Expose()
  payoutFrequency?: string;

  @ApiPropertyOptional()
  @Expose()
  payoutDay?: string;

  @ApiProperty({ default: true })
  @Expose()
  notifyOnPayout: boolean;
}
