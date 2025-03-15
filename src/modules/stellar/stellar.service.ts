import { Injectable } from '@nestjs/common';
import { UpdateStellarDto } from './dto/update-stellar.dto';
import { ConfigService } from '@nestjs/config';
import { Horizon, Networks, Transaction } from '@stellar/stellar-sdk';
import { ENV_TESTNET } from '@/constants/env';
import { NETWORK_PASSPHRASES } from '@/constants/stellar';

@Injectable()
export class StellarService {
  private rpcUrl: string;
  private server: Horizon.Server;

  constructor(private configService: ConfigService) {
    this.rpcUrl =
      this.configService.get<string>('NODE_ENV') === ENV_TESTNET
        ? this.configService.get<string>('STELLAR_RPC_ENDPOINT')
        : this.configService.get<string>('SOROBAN_RPC_ENDPOINT');

    this.server = new Horizon.Server(this.rpcUrl, {
      allowHttp:
        this.configService.get<string>('NODE_ENV') === ENV_TESTNET
          ? true
          : false,
    });
  }

  async submitTx(signedTx: string) {
    try {
      const txn = new Transaction(signedTx, this.getNetworkPassphrase());
      return await this.server.submitTransaction(txn);
    } catch (err) {
      console.log(err);
    }
  }

  getNetworkPassphrase(): Networks {
    return NETWORK_PASSPHRASES[this.configService.get<string>('NODE_ENV')];
  }
}
