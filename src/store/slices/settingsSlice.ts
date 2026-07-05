import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { publicApi } from '../../services/api'
import type { RootState } from '../index'
import type { LookupItem } from './lookupsSlice'

export interface FeeConfig {
  type: 'percent' | 'flat'
  value: number
  label?: string
}

export interface ProcessingFees {
  raast_qr: number
  raast_rtp: number
  bank_account: number
  wallet: number
  card_local: number
  card_international: number
}

export interface AppConfig {
  platform_fee?: FeeConfig
  processing_fee_default?: FeeConfig
  tax_percent?: number
  processing_fees?: ProcessingFees
  [key: string]: unknown
}

interface SettingsState {
  config: AppConfig | null
  selectedCountryCode: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: SettingsState = {
  config: null,
  selectedCountryCode: 'PK',
  status: 'idle',
}

export const fetchAppConfig = createAsyncThunk('settings/fetchConfig', async () => {
  const res = await publicApi.get<{ data: AppConfig }>('/api/settings/')
  return res.data.data
})

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCountry(state, action: PayloadAction<string>) {
      state.selectedCountryCode = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppConfig.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAppConfig.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.config = action.payload
      })
      .addCase(fetchAppConfig.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export const { setCountry } = settingsSlice.actions
export default settingsSlice.reducer

export const selectAppConfig = (state: RootState) => state.settings.config
export const selectSelectedCountryCode = (state: RootState) => state.settings.selectedCountryCode
export const selectSettingsStatus = (state: RootState) => state.settings.status

export const selectSelectedCountry = (state: RootState): LookupItem | null => {
  const countries = state.lookups?.byType['country'] ?? []
  const code = state.settings.selectedCountryCode
  return countries.find((c) => c.code === code) ?? countries[0] ?? null
}

export const selectCurrencySymbol = (state: RootState): string => {
  const country = selectSelectedCountry(state)
  return (country?.extra?.currency_symbol as string) ?? 'Rs'
}

export const selectCurrencyCode = (state: RootState): string => {
  const country = selectSelectedCountry(state)
  return (country?.extra?.currency_code as string) ?? 'PKR'
}

export const selectLocale = (state: RootState): string => {
  const country = selectSelectedCountry(state)
  return (country?.extra?.locale as string) ?? 'en-PK'
}

export const selectActiveStates = (state: RootState): LookupItem[] => {
  const country = selectSelectedCountry(state)
  if (!country) return []
  return (state.lookups?.byType['state'] ?? []).filter((s) => s.parent === country.id)
}

export const selectActiveCities = (state: RootState): LookupItem[] => {
  const country = selectSelectedCountry(state)
  if (!country) return []
  return (state.lookups?.byType['city'] ?? []).filter((c) => c.parent === country.id)
}

export const selectPlatformFee = (state: RootState): FeeConfig | null =>
  state.settings.config?.platform_fee ?? null

export const selectProcessingFeeDefault = (state: RootState): FeeConfig | null =>
  state.settings.config?.processing_fee_default ?? null

export const selectTaxPercent = (state: RootState): number =>
  state.settings.config?.tax_percent ?? 0
