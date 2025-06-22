import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { CwalletProfilesEntity } from './cwallet-profiles.entity';
import { SupportedBlockchainType } from '@/config/settings';
import { Exclude, Expose, Type } from 'class-transformer';
import { BaseEntity } from '../../base.entity';
import { TokenEntity } from '../../token/token.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'cwallets' })
export class CwalletsEntity extends BaseEntity {
  @Expose()
  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'Reference string',
  })
  @Column({ type: 'varchar', nullable: true, name: 'reference' })
  reference: string | null;

  @Expose()
  @ApiProperty({ type: 'string', description: 'Currency type' })
  @Column({ type: 'varchar', name: 'currency' })
  currency: string;

  @Expose()
  @ApiProperty({ type: 'string', description: 'Wallet address' })
  @Column({ type: 'varchar', name: 'address' })
  address: string;

  @Expose()
  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'Total payments',
  })
  @Column({ type: 'varchar', nullable: true, name: 'total_payments' })
  totalPayments: string | null;

  @Expose()
  @ApiProperty({
    enum: SupportedBlockchainType,
    description: 'Default blockchain network',
  })
  @Column({
    type: 'enum',
    enum: SupportedBlockchainType,
    name: 'default_network',
    default: SupportedBlockchainType.MATIC,
  })
  defaultNetwork: SupportedBlockchainType;

  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Creation date',
  })
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Last update date',
  })
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Expose()
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Wallet ID' })
  @Column({ type: 'uuid', nullable: false, name: 'wallet_id' })
  walletID: string;

  @Expose()
  @ApiProperty({ type: 'string', description: 'Custody type' })
  @Column({ type: 'varchar', name: 'custody_type' })
  custodyType: string;

  @Expose()
  @ApiProperty({ type: 'string', description: 'Account type' })
  @Column({ type: 'varchar', name: 'account_type' })
  accountType: string;

  @Expose()
  @ApiProperty({
    type: 'string',
    nullable: true,
    description: 'State of the wallet',
  })
  @Column({ type: 'varchar', nullable: true, name: 'state' })
  state: string | null;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true, description: 'SCA core info' })
  @Column({ type: 'varchar', nullable: true, name: 'sca_core' })
  scaCore: string | null;

  @Expose()
  @ApiProperty({
    isArray: true,
    enum: SupportedBlockchainType,
    description: 'Supported blockchain networks',
  })
  @Column({
    type: 'simple-array',
    name: 'networks',
  })
  networks: SupportedBlockchainType[];

  @Exclude()
  @ManyToOne(() => CwalletProfilesEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: CwalletProfilesEntity;

  @Expose()
  @ApiProperty({
    type: () => [TokenEntity],
    description: 'Tokens associated with this wallet',
    isArray: true,
  })
  @OneToMany(() => TokenEntity, (token) => token.cwallet, { eager: true })
  tokens: TokenEntity[];
}

@Exclude()
export class ICwalletsDto extends CwalletsEntity {
  @Exclude()
  profile: CwalletProfilesEntity;
}
