export interface IYellowCardRateDto {
  buy: number;
  sell: number;
  locale: string;
  rateId: string;
  code: string;
  updatedAt: string; // ISO date string
}

export interface IYellowCardRatesResponseDto {
  rates: IYellowCardRateDto[];
}
