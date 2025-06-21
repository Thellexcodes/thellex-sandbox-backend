import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity, IBaseEntity } from './base.entity';
import { AuthenticatorTransportFuture } from '@simplewebauthn/server';

@Entity({ name: 'devices' })
export class DeviceEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'token', nullable: true, type: 'varchar' })
  token: string | null;

  @Column({ name: 'name', nullable: true, type: 'varchar' })
  name: string | null;

  @Column({ name: 'agent', nullable: true, type: 'varchar' })
  agent: string | null;

  @Column({ name: 'ip', nullable: true, type: 'varchar' })
  ip: string | null;

  @Column({ name: 'location', nullable: true, type: 'varchar' })
  location: string | null;

  @Column({ name: 'type', nullable: true, type: 'varchar' })
  type: string | null;

  @Column({ name: 'count', nullable: true, type: 'int' })
  count: number | null;

  @Column({ name: 'device_token', nullable: true, type: 'varchar' })
  deviceToken: string | null;

  @Column({ name: 'credential_id', nullable: true, type: 'varchar' })
  credentialID: string | null;

  @Column({ name: 'public_key', nullable: true, type: 'varchar' })
  publicKey: string | null;

  @Column({ name: 'transports', nullable: true, type: 'text', array: true })
  transports: AuthenticatorTransportFuture[] | null;

  @Column('json', { name: 'attestation_response', nullable: true })
  attestationResponse: object | null;

  @Column('text', { name: 'attestation_object', nullable: true })
  attestationObject: string | null;
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
