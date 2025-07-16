import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Entity({ name: 'bank_accounts' })
export class BankAccountEntity extends BaseEntity {
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.bankAccounts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Expose()
  @ApiProperty({ description: 'Bank name' })
  @Column({ name: 'bank_name', type: 'varchar', length: 100 })
  bankName: string;

  @Expose()
  @ApiProperty({ description: 'Account holder name' })
  @Column({ name: 'account_name', type: 'varchar', length: 150 })
  accountName: string;

  @Expose()
  @ApiProperty({ description: 'Bank account number' })
  @Column({ name: 'account_number', type: 'varchar', length: 50 })
  accountNumber: string;

  @Expose()
  @ApiPropertyOptional({ description: 'SWIFT code', maxLength: 11 })
  @Column({ name: 'swift_code', type: 'varchar', length: 11, nullable: true })
  swiftCode?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'IBAN number', maxLength: 34 })
  @Column({ type: 'varchar', length: 34, nullable: true })
  iban?: string;

  @Expose()
  @ApiProperty({ description: 'Indicates if this is the primary bank account' })
  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column()
  external_createdAt: Date;

  @Column({ type: 'boolean', default: false })
  require_consent: boolean;

  @Column({ type: 'varchar', nullable: true })
  consent_url: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string;

  @Column({ type: 'varchar', nullable: true })
  eur: string;
}

@Exclude()
export class IBankAccountDto extends BankAccountEntity {}
