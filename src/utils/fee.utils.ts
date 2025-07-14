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
export async function calculateNetCryptoAmount(
  fiatAmount: number, // e.g. ₦15,000
  feeValue: number, // e.g. 200 for 2%
  rate: number, // e.g. 1615 NGN/USDT
) {
  const feeDecimal = feeValue / 10000; // e.g. 200 → 0.02
  const feeAmount = fiatAmount * feeDecimal; // ₦300
  const netFiatAmount = fiatAmount - feeAmount; // ₦14,700

  const grossCrypto = parseFloat((fiatAmount / rate).toFixed(6)); // Before fees
  const netCryptoAmount = parseFloat((netFiatAmount / rate).toFixed(6)); // After fees

  return {
    netFiatAmount, // Amount after fee deduction
    feeAmount, // Fee in fiat
    feeLabel: `${(feeDecimal * 100).toFixed(2)}%`, // e.g. '2.00%'
    grossCrypto, // Fiat to crypto before fees
    netCryptoAmount, // Fiat to crypto after fee
  };
}

export async function calculateNetFiatAmount(
  cryptoAmount: number,
  feeValue: number, // e.g., 200 for 2%
  rate: number,
) {
  const feeDecimal = feeValue / 10000; // e.g. 200 → 0.02
  const grossFiat = cryptoAmount * rate; // e.g. 10 * 1615 = ₦16,150
  const feeAmount = grossFiat * feeDecimal; // ₦16,150 * 0.02 = ₦323
  const netFiatAmount = parseFloat((grossFiat - feeAmount).toFixed(2)); // ₦15,827.00
  const netCryptoAmount = parseFloat((netFiatAmount / rate).toFixed(6)); // 15,827 / 1615 ≈ 9.8

  return {
    grossFiat,
    feeAmount,
    feeLabel: `${(feeDecimal * 100).toFixed(2)}%`,
    netFiatAmount,
    netCryptoAmount,
  };
}
