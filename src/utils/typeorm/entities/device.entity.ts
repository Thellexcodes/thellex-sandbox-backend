import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';
import { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'devices' })
export class DeviceEntity extends BaseEntity {
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Expose()
  @ApiProperty()
  @Column({ name: 'token', nullable: true, type: 'varchar' })
  token: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'name', nullable: true, type: 'varchar' })
  name: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'agent', nullable: true, type: 'varchar' })
  agent: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ip', nullable: true, type: 'varchar' })
  ip: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'location', nullable: true, type: 'varchar' })
  location: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'type', nullable: true, type: 'varchar' })
  type: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'count', nullable: true, type: 'int' })
  count: number | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'device_token', nullable: true, type: 'varchar' })
  deviceToken: string | null;

  @Column({ name: 'credential_id', nullable: true, type: 'varchar' })
  credentialID: string | null;

  @Expose()
  @ApiProperty()
  @Column({ name: 'public_key', nullable: true, type: 'varchar' })
  publicKey: string | null;

  @Column({ name: 'transports', nullable: true, type: 'text', array: true })
  transports: AuthenticatorTransportFuture[] | null;

  @Column('json', { name: 'attestation_response', nullable: true })
  attestationResponse: object | null;

  @Column('text', { name: 'attestation_object', nullable: true })
  attestationObject: string | null;
}

@Exclude()
export class IDeviceDto extends DeviceEntity {
  @Exclude() user: UserEntity;
  @Exclude() credentialID: string;
  @Exclude() publicKey: string;
  @Exclude() transports: AuthenticatorTransportFuture[];
  @Exclude() attestationResponse: object;
  @Exclude() attestationObject: string;
}
