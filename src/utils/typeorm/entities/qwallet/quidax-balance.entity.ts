import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QwalletEntity } from './qwallet.entity';

@Entity()
export class QuidaxBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QwalletEntity, (wallet) => wallet.balances)
  wallet: QwalletEntity;

  @Column()
  chain: 'bsc' | 'tron' | 'ethereum';

  @Column()
  token: 'usdt';

  @Column('decimal', { precision: 18, scale: 6 })
  balance: number;
}
