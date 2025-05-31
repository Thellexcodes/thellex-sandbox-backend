import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'qwallet' })
export class QwalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.qwallet, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
