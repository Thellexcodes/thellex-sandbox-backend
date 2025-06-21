import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IUserDto, UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { Expose } from 'class-transformer';

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

export class IDeviceDto extends BaseEntity {
  @Expose()
  user: IUserDto;

  @Expose()
  token?: string | null;

  @Expose()
  name?: string | null;

  @Expose()
  agent?: string | null;

  @Expose()
  ip?: string | null;

  @Expose()
  location?: string | null;

  @Expose()
  type?: string | null;

  @Expose()
  count?: number | null;

  @Expose({ name: 'device_token' })
  device_token?: string | null;

  @Expose()
  credentialID?: string | null;

  @Expose()
  publicKey?: string | null;

  @Expose()
  transports?: AuthenticatorTransportFuture[] | null;

  @Expose()
  attestationResponse?: object | null;

  @Expose()
  attestationObject?: string | null;
}
