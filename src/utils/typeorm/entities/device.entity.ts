import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('devices')
export class DeviceEntity extends BaseEntity {
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

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  device_token: string;
}
