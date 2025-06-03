import { QWallet } from '@/types/qwallet.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'qwallet' })
export class QwalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.qwallet, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'quidax_id', type: 'uuid', nullable: false, unique: true })
  quidaxId: string;

  @Column({ name: 'quidax_sn', type: 'varchar', nullable: false, unique: true })
  quidaxSn: string;

  @Column({ name: 'state', type: 'varchar', default: 'active' })
  state: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName: string;

  @Column({ name: 'reference', type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: false })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: false })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  walelts: QWallet[] | null;
}

// {
//   "status": "success",
//   "message": "Successful",
//   "data": [
//     {
//       "id": "2ed922fe-a10d-405a-9745-c9eb2c92e6b6",
//       "sn": "QDXRTFBY2I6",
//       "email": "boltdsg@gmail.com",
//       "reference": null,
//       "first_name": "test",
//       "last_name": "user",
//       "display_name": null,
//       "created_at": "2025-06-01T12:42:25.000+01:00",
//       "updated_at": "2025-06-01T12:42:25.000+01:00"
//     },
//     {
//       "id": "31a6aa62-cbe8-4bc4-a37e-058e3e56c7d6",
//       "sn": "QDX54E4WEEK",
//       "email": "thellejobs@gmail.com",
//       "reference": null,
//       "first_name": "test",
//       "last_name": "user",
//       "display_name": null,
//       "created_at": "2025-06-01T12:45:12.000+01:00",
//       "updated_at": "2025-06-01T12:45:12.000+01:00"
//     }
//   ]
// }
