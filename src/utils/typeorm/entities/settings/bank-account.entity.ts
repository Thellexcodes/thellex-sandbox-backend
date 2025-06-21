import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IUserDto, UserEntity } from '../user.entity';
import { BaseDto, BaseEntity } from '../base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

@Entity({ name: 'bank_accounts' })
export class BankAccountEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.bankAccounts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'bank_name' })
  bankName: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ name: 'account_number' })
  accountNumber: string;

  @Column({ name: 'swift_code', nullable: true })
  swiftCode?: string;

  @Column({ nullable: true })
  iban?: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;
}

export class IBankAccountDto extends BaseDto {
  @ApiProperty({ type: () => IUserDto })
  @Expose()
  @Type(() => IUserDto)
  user: IUserDto;

  @ApiProperty()
  @Expose()
  bankName: string;

  @ApiProperty()
  @Expose()
  accountName: string;

  @ApiProperty()
  @Expose()
  accountNumber: string;

  @ApiPropertyOptional()
  @Expose()
  swiftCode?: string;

  @ApiPropertyOptional()
  @Expose()
  iban?: string;

  @ApiProperty({ default: false })
  @Expose()
  isPrimary: boolean;
}
