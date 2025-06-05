import { Injectable } from '@nestjs/common';

@Injectable()
export class RampHooksService {
  handleSellSuccessful(payload: any, headers: any) {
    return { message: 'Sell transaction successful received', payload };
  }

  handleSellProcessing(payload: any, headers: any) {
    return { message: 'Sell transaction processing', payload };
  }

  handleSellFailed(payload: any, headers: any) {
    return { message: 'Sell transaction failed', payload };
  }

  handleBuySuccessful(payload: any, headers: any) {
    return { message: 'Buy transaction successful', payload };
  }

  handleBuyProcessing(payload: any, headers: any) {
    return { message: 'Buy transaction processing', payload };
  }

  handleBuyFailed(payload: any, headers: any) {
    return { message: 'Buy transaction failed', payload };
  }
}
