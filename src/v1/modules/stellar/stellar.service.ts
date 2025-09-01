import { Injectable } from '@nestjs/common';
import { UpdateStellarDto } from './dto/update-stellar.dto';
import { Horizon, Networks } from '@stellar/stellar-sdk';
import { getAppConfig } from '@/v1/constants/env';
import { NETWORK_PASSPHRASES } from '@/v1/constants/stellar';
import { ENV_TESTNET } from '@/v1/models/settings.types';
import { ConfigService } from '@/v1/config/config.service';

@Injectable()
export class StellarService {
  private rpcUrl: string;
  private server: Horizon.Server;

  constructor(private configService: ConfigService) {
    this.rpcUrl = getAppConfig().BLOCKCHAIN.STELLAR_RPC_URL;

    // this.server = new Horizon.Server(this.rpcUrl, {
    //   allowHttp:
    //     this.configService.get<string>('NODE_ENV') === ENV_TESTNET
    //       ? true
    //       : false,
    // });
  }

  // async submitTx(signedTx: string) {
  //   try {
  //     const txn = new Transaction(signedTx, this.getNetworkPassphrase());
  //     return await this.server.submitTransaction(txn);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // getNetworkPassphrase(): Networks {
  //   return NETWORK_PASSPHRASES[this.configService.get<string>('NODE_ENV')];
  // }
}
