import type { FeeConfig } from '../store/slices/settingsSlice'

export function computeFee(feeConfig: FeeConfig | null | undefined, subtotal: number): number {
  if (!feeConfig || !feeConfig.value) return 0
  if (feeConfig.type === 'flat') return feeConfig.value
  return Math.round((subtotal * feeConfig.value / 100) * 100) / 100
}

// Tax only applies to the platform's own revenue from the sale (its flat platform fee
// plus its commission cut of the sale), never the organizer's share. Returns null when
// commissionPercent is missing so callers can refuse to check out rather than show a
// silently-wrong number.
export function computeCommissionTax(
  platformFeeAmount: number,
  commissionPercent: number | null | undefined,
  discountedSubtotal: number,
  taxPercent: number,
): number | null {
  if (commissionPercent == null || Number.isNaN(commissionPercent)) return null
  const commissionAmount = (commissionPercent / 100) * discountedSubtotal
  const taxBase = platformFeeAmount + commissionAmount
  return computeFee({ type: 'percent', value: taxPercent }, taxBase)
}
