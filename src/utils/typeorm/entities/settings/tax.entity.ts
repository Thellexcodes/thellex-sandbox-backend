import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserEntity } from '../user.entity';

@Entity('tax_settings')
export class TaxSettingEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.taxSettings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column('decimal', {
    name: 'tax_rate',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  taxRate?: number;

  @Column({ name: 'is_tax_inclusive', default: false })
  isTaxInclusive?: boolean;
}
