import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import {
  CwalletProfilesEntity,
  ICwalletProfilesDto,
} from './cwallet-profiles.entity';
import { SupportedBlockchainType } from '@/config/settings';
import { ENV_TESTNET } from '@/constants/env';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BaseEntity } from '../../base.entity';
import { ITokenDto, TokenEntity } from '../../token/token.entity';

@Entity({ name: 'cwallets' })
export class CwalletsEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, name: 'reference' })
  reference: string | null;

  @Column({ type: 'varchar', name: 'currency' })
  currency: string;

  @Column({ type: 'varchar', name: 'address' })
  address: string;

  @Column({ type: 'varchar', nullable: true, name: 'total_payments' })
  totalPayments: string | null;

  @Column({
    type: 'enum',
    enum: SupportedBlockchainType,
    name: 'default_network',
    default:
      process.env.NODE_ENV === ENV_TESTNET
        ? SupportedBlockchainType.MATIC_AMOY
        : SupportedBlockchainType.MATIC,
  })
  defaultNetwork: SupportedBlockchainType;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: false, name: 'wallet_id' })
  walletID: string;

  @Column({ type: 'varchar', name: 'custody_type' })
  custodyType: string;

  @Column({ type: 'varchar', name: 'account_type' })
  accountType: string;

  @Column({ type: 'varchar', nullable: true, name: 'state' })
  state: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'sca_core' })
  scaCore: string | null;

  @Column({
    type: 'simple-array',
    name: 'networks',
  })
  networks: SupportedBlockchainType[];

  @ManyToOne(() => CwalletProfilesEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: CwalletProfilesEntity;

  @OneToMany(() => TokenEntity, (token) => token.cwallet, { eager: true })
  tokens: TokenEntity[];
}

export class ICwalletsDto {
  @ApiPropertyOptional({ type: String })
  @Expose()
  reference: string | null;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  totalPayments: string | null;

  @ApiProperty({ enum: SupportedBlockchainType })
  @Expose()
  defaultNetwork: SupportedBlockchainType;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: String, format: 'uuid' })
  @Expose()
  walletID: string;

  @ApiProperty()
  @Expose()
  custodyType: string;

  @ApiProperty()
  @Expose()
  accountType: string;

  @ApiPropertyOptional({ type: String })
  @Expose()
  state: string | null;

  @ApiPropertyOptional({ type: String })
  @Expose()
  scaCore: string | null;

  @ApiProperty({
    enum: SupportedBlockchainType,
    isArray: true,
  })
  @Expose()
  networks: SupportedBlockchainType[];

  @ApiProperty({ type: () => ICwalletProfilesDto })
  @Expose()
  @Type(() => ICwalletProfilesDto)
  profile: ICwalletProfilesDto;

  @ApiProperty({ type: () => [ITokenDto] })
  @Expose()
  @Type(() => ITokenDto)
  tokens: ITokenDto[];
}
