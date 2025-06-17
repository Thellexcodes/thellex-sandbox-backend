import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity, IBaseEntity } from './base.entity';
import { AuthenticatorTransportFuture } from '@simplewebauthn/server';

@Entity('devices')
export class DeviceEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  agent: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  count: number;

  @Column({ nullable: true })
  device_token: string;

  @Column({ nullable: true })
  credentialID: string;

  @Column({ nullable: true })
  publicKey: string;

  @Column({ nullable: true, type: 'text', array: true })
  transports: AuthenticatorTransportFuture[];

  @Column('json', { nullable: true })
  attestationResponse: object;

  @Column('text', { nullable: true })
  attestationObject: string;
}

export interface IDeviceEntity extends IBaseEntity {
  user: UserEntity;
  token?: string | null;
  name?: string | null;
  agent?: string | null;
  ip?: string | null;
  location?: string | null;
  type?: string | null;
  count?: number | null;
  device_token?: string | null;
  credentialID?: string | null;
  publicKey?: string | null;
  transports?: AuthenticatorTransportFuture[] | null;
  attestationResponse?: object | null;
  attestationObject?: string | null;
}
