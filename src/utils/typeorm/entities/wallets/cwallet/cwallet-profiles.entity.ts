import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { CwalletsEntity } from './cwallet.entity';
import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from '../../user.entity';
import { BaseEntity } from '../../base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'cwallet_profiles' })
export class CwalletProfilesEntity extends BaseEntity {
  @Exclude()
  @OneToOne(() => UserEntity, (user) => user.cWalletProfile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Expose()
  @ApiProperty({ description: 'Profile state', default: 'active' })
  @Column({ name: 'state', type: 'varchar', default: 'active' })
  state: string;

  @Expose()
  @ApiProperty({
    description: 'Unique wallet set identifier',
    type: 'string',
    format: 'uuid',
  })
  @Column({ name: 'wallet_set_id', type: 'uuid', unique: true })
  walletSetId: string;

  @Expose()
  @ApiProperty({ description: 'Display name', type: 'string', nullable: true })
  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @Expose()
  @ApiProperty({
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    type: () => [CwalletsEntity],
    description: 'Associated wallets',
    isArray: true,
  })
  @OneToMany(() => CwalletsEntity, (wallet) => wallet.profile, {
    cascade: true,
    eager: true,
  })
  wallets: CwalletsEntity[];
}

@Exclude()
export class ICwalletProfilesDto extends CwalletProfilesEntity {}
