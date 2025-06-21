import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDto, BaseEntity } from './base.entity';
import { IUserDto, UserEntity } from './user.entity';
import { Expose, Type } from 'class-transformer';

@Entity({ name: 'auth' })
export class AuthEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.auth, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: false, unique: true })
  challenge: string;

  @Column({ nullable: true, default: false })
  expired: boolean;
}

export class IAuthDto extends BaseDto {
  @Expose()
  challenge!: string;

  @Expose()
  expired?: boolean;

  @Expose()
  @Type(() => IUserDto)
  user!: IUserDto;
}
