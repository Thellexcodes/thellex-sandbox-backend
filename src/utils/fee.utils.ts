export function convertFeeValueToPercentageString(feeValue: number): string {
  return `${(feeValue / 100).toFixed(2)}%`;
}

/**
 *
 * @param amount
 * @param feeValue
 * @returns
 */
export function calculateAdjustedAmount(
  amount: number,
  feeValue: number,
): { feeAmount: number; adjustedAmount: number; feeLabel: string } {
  const feePercentage = feeValue / 10000; // Convert to decimal (e.g., 300 => 0.03)
  const feeAmount = amount * feePercentage;
  const adjustedAmount = amount + feeAmount;
  const feeLabel = convertFeeValueToPercentageString(feeValue);
  return { feeAmount, adjustedAmount, feeLabel };
}

/**
 *
 * @param amount amount to convert
 * @param feeValue  amount fee
 * @param rate  rate
 * @returns
 */
export function calculateNetCryptoAmount(
  amount: number,
  feeValue: number, // e.g., 200 for 2%
  rate: number,
) {
  const feeDecimal = feeValue / 10000; // e.g. 200 -> 0.02
  const feeAmount = amount * feeDecimal; // e.g. ₦15,000 * 0.02 = ₦300
  const adjustedNaira = amount - feeAmount; // e.g. ₦14,700

  const grossCrypto = parseFloat((adjustedNaira / rate).toFixed(6)); // e.g. 14,700 / 1615 ≈ 9.105

  return {
    adjustedNaira,
    feeAmount,
    feeLabel: `${(feeDecimal * 100).toFixed(2)}%`,
    grossCrypto,
  };
}

export function calculateNetFiatAmount(
  cryptoAmount: number,
  feeValue: number, // e.g., 200 for 2%
  rate: number,
) {
  const feeDecimal = feeValue / 10000; // e.g. 200 -> 0.02
  const grossFiat = cryptoAmount * rate; // e.g. 10 * 1615 = ₦16,150
  const feeAmount = grossFiat * feeDecimal; // e.g. ₦16,150 * 0.02 = ₦323
  const netFiatAmount = parseFloat((grossFiat - feeAmount).toFixed(2)); // e.g. ₦15,827.00

  return {
    grossFiat,
    feeAmount,
    feeLabel: `${(feeDecimal * 100).toFixed(2)}%`,
    netFiatAmount,
  };
}
