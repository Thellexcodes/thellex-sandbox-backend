import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CwalletsEntity, ICwalletsDto } from './cwallet.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IUserDto, UserEntity } from '../../user.entity';
import { BaseDto } from '../../base.entity';

@Entity({ name: 'cwallet_profiles' })
export class CwalletProfilesEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.cWalletProfile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'state', type: 'varchar', default: 'active' })
  state: string;

  @Column({ name: 'wallet_set_id', type: 'uuid', unique: true })
  walletSetId: string;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => CwalletsEntity, (wallet) => wallet.profile, {
    cascade: true,
    eager: true,
  })
  wallets: CwalletsEntity[];
}

export class ICwalletProfilesDto extends BaseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ type: () => IUserDto })
  @Type(() => IUserDto)
  user: IUserDto;

  @ApiProperty()
  @Expose()
  state: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  walletSetId: string;

  @ApiPropertyOptional()
  @Expose()
  displayName: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => [ICwalletsDto] })
  @Expose()
  @Type(() => ICwalletsDto)
  wallets: ICwalletsDto[];
}
