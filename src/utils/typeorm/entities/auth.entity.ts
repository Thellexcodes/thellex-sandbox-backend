import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'auth' })
export class AuthEntity extends BaseEntity {
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
export class IAuthDto extends AuthEntity {
  @Exclude() user: UserEntity;
}
