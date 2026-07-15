import type { FeeConfig } from '../store/slices/settingsSlice'

export function computeFee(feeConfig: FeeConfig | null | undefined, subtotal: number): number {
  if (!feeConfig || !feeConfig.value) return 0
  if (feeConfig.type === 'flat') return feeConfig.value
  return Math.round((subtotal * feeConfig.value / 100) * 100) / 100
}
