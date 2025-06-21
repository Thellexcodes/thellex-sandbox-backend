import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IUserDto, UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

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

@Exclude()
export class IBankAccountDto extends BankAccountEntity {}
