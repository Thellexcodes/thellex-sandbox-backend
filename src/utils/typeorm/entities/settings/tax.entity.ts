import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseDto, BaseEntity } from '../base.entity';
import { IUserDto, UserEntity } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tax_settings')
export class TaxSettingEntity extends BaseEntity {
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

export class ITaxSettingDto extends BaseDto {
  @ApiProperty({
    description: 'The user associated with these tax settings',
    type: () => IUserDto,
  })
  user: IUserDto;

  @ApiProperty({
    description:
      'Tax rate as a decimal number with up to 5 digits and 2 decimals',
    example: 7.5,
    required: false,
    type: 'number',
    nullable: true,
  })
  taxRate?: number;

  @ApiProperty({
    description: 'Whether the tax is inclusive or exclusive',
    example: false,
    default: false,
    required: false,
    type: 'boolean',
  })
  isTaxInclusive?: boolean;
}
