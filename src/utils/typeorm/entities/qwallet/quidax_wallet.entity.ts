import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quidax_wallets')
export class QuidaxWalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  reference: string;

  @Column()
  currency: string;

  @Column()
  address: string;

  @Column()
  network: string;

  @Column()
  is_crypto: boolean;

  @Column({ nullable: true })
  destination_tag: string;

  @Column({ nullable: true })
  deposit_address: string;

  @Column({ nullable: true })
  total_payments: string;

  @Column()
  created_at: string;

  @Column()
  updated_at: string;

  @Column()
  balance: string;

  @Column()
  default_network: string;
}
