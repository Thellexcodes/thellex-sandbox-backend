import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { IUserDto, UserEntity } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('tax_settings')
export class TaxSettingEntity extends BaseEntity {
  @Exclude()
  @OneToOne(() => UserEntity, (user) => user.taxSettings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column('decimal', {
    name: 'tax_rate',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  taxRate?: number;

  @Column({ name: 'is_tax_inclusive', default: false })
  isTaxInclusive?: boolean;
}

@Exclude()
export class ITaxSettingDto extends TaxSettingEntity {}
