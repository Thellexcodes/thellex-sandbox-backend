import { BaseEntity as Base, Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

export interface IBaseEntity extends Base {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
