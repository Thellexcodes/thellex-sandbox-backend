import { BaseDto, BaseEntity } from '@/utils/typeorm/entities/base.entity';
import { IUserDto, UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Expose, Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'card_management' })
export class CardManagementEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.auth, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'transaction_id', type: 'varchar' })
  transactionId: string;

  @Column({ name: 'asset_code', type: 'varchar' })
  assetCode: string;

  @Column({ name: 'asset_issuer', type: 'varchar' })
  assetIssuer: string;

  @Column({ name: 'amount', type: 'varchar' })
  amount: string;
}

export class ICardManagementDto extends BaseDto {
  @Expose()
  @Type(() => IUserDto)
  user: IUserDto;

  @Expose()
  transactionId: string;

  @Expose()
  assetCode: string;

  @Expose()
  assetIssuer: string;

  @Expose()
  amount: string;
}
