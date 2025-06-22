import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { QWalletsEntity } from './qwallets.entity';
import { BaseEntity } from '../../base.entity';
import { WalletProviderEnum } from '@/config/settings';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'qwallet_profiles' })
export class QWalletProfileEntity extends BaseEntity {
  @Exclude()
  @OneToOne(() => UserEntity, (user) => user.qWalletProfile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'qid', type: 'uuid', nullable: false, unique: true })
  qid: string;

  @Column({ name: 'q_sn', type: 'varchar', nullable: false, unique: true })
  qsn: string;

  @Column({ name: 'state', type: 'varchar', default: 'active' })
  state: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName: string;

  @Column({ name: 'reference', type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({ type: 'enum', enum: WalletProviderEnum })
  walletProvider: WalletProviderEnum;

  @OneToMany(() => QWalletsEntity, (wallet) => wallet.profile, {
    cascade: true,
    eager: true,
  })
  wallets: QWalletsEntity[];
}

@Exclude()
export class IQWalletProfileDto extends QWalletProfileEntity {
  @Expose()
  @ApiProperty({ type: 'string', format: 'uuid' })
  qid: string;

  @Expose()
  @ApiProperty({ type: 'string' })
  qsn: string;

  @Expose()
  @ApiProperty({ type: 'string', default: 'active' })
  state: string;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  firstName: string;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  lastName: string;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  reference: string | null;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  displayName: string | null;

  @Expose()
  @ApiProperty({ enum: WalletProviderEnum })
  walletProvider: WalletProviderEnum;

  @Expose()
  @Type(() => QWalletsEntity)
  @ApiProperty({ type: () => [QWalletsEntity] })
  wallets: QWalletsEntity[];
}
