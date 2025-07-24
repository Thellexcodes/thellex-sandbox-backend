import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate } from 'class-validator';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeOrmBase,
} from 'typeorm';

export abstract class BaseEntity extends TypeOrmBase {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @ApiProperty({ example: '2025-07-14T13:23:47.812Z' })
  @IsDate()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

export class BaseDto {
  id: string;

  createdAt: Date;

  updatedAt: Date;
}
