import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { AuthnEntity } from './authn.entity';
import { AuthVerificationCodesEntity } from './authVerificationCodes.entities';
import { DeviceEntity } from './device.entity';
import { CardManagementEntity } from '@/utils/typeorm/entities/card-management.entity';
import { QwalletEntity } from './qwallet.entity';
import { DKycEntity } from './dkyc.entity';
import { NotificationEntity } from './notification.entity';
import { TransactionHistoryEntity } from './transaction-history.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uid: number;

  @Column({ nullable: true })
  account: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true, default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  suspended: boolean;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'uuid_generate_v4()',
  })
  alertID: string;

  @OneToMany(
    () => AuthVerificationCodesEntity,
    (authVerificationCode) => authVerificationCode.user,
    { cascade: true },
  )
  verificationCodes: AuthVerificationCodesEntity[];

  @OneToMany(() => AuthnEntity, (authn) => authn.user)
  authn: AuthnEntity[];

  @OneToMany(() => DeviceEntity, (device) => device.user)
  devices: DeviceEntity[];

  @OneToMany(() => CardManagementEntity, (card) => card.user)
  electronic_cards: CardManagementEntity[];

  @OneToOne(() => QwalletEntity, (qwallet) => qwallet.user, {
    cascade: true,
  })
  qwallet: QwalletEntity;

  @OneToOne(() => DKycEntity, (dkyc) => dkyc.user, {
    nullable: true,
    cascade: true,
    eager: false,
  })
  @JoinColumn()
  dkyc: DKycEntity;

  @OneToMany(
    () => TransactionHistoryEntity,
    (transactionHistory) => transactionHistory.user,
  )
  transactionHistory: TransactionHistoryEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user, {
    cascade: true,
  })
  notifications: NotificationEntity[];
}
