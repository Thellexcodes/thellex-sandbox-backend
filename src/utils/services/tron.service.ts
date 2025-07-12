import { BlockchainNetworkSettings } from '@/config/settings';
import Tron, { BigNumber, TronWeb } from 'tronweb';

export class TronService {
  private tronWeb: TronWeb;

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: BlockchainNetworkSettings.trc20.rpcUrl,
    });
  }

  async createWallet(): Promise<{ address: string; privateKey: string }> {
    const account = await this.tronWeb.createAccount();
    return {
      address: account.address.base58,
      privateKey: account.privateKey,
    };
  }

  async getTrxBalance(address: string): Promise<string | BigNumber> {
    const balance = await this.tronWeb.trx.getBalance(address);
    return this.tronWeb.fromSun(balance);
  }

  async getTrc20Balance(
    tokenAddress: string,
    walletAddress: string,
  ): Promise<string | any> {
    const contract = await this.tronWeb.contract().at(tokenAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();
    return balance;
  }

  async sendTrx(to: string, amountInTRX: number): Promise<string> {
    this.tronWeb.setPrivateKey(BlockchainNetworkSettings.trc20.secretKey);

    const amountInSun = amountInTRX * 1_000_000;

    const unsignedTx = await this.tronWeb.transactionBuilder.sendTrx(
      to,
      amountInSun,
    );
    const signedTx = await this.tronWeb.trx.sign(unsignedTx);
    const result = await this.tronWeb.trx.sendRawTransaction(signedTx);

    return result.txid;
  }

  async sendTrc20Token(
    tokenAddress: string,
    to: string,
    amount: string,
    decimals = 6,
  ): Promise<string> {
    this.tronWeb.setPrivateKey(BlockchainNetworkSettings.trc20.secretKey);
    const contract = await this.tronWeb.contract().at(tokenAddress);

    const amountInUnits = this.tronWeb
      .BigNumber(amount)
      .multipliedBy(10 ** decimals)
      .toFixed(0);

    const tx = await contract.methods.transfer(to, amountInUnits).send();

    return tx;
  }
}
