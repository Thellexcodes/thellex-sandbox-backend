import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user/user.entity';

@Entity({ name: 'auth' })
export class AuthEntity extends BaseEntity {
  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.auth, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Expose()
  @ApiProperty()
  @Column({ nullable: false, unique: true })
  challenge: string;

  @Expose()
  @ApiProperty()
  @Column({ nullable: true, default: false })
  expired: boolean;
}

@Exclude()
export class IAuthDto extends AuthEntity {}
