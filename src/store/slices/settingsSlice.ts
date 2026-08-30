import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { publicApi } from '../../services/api'
import type { RootState } from '../index'
import type { LookupItem } from './lookupsSlice'

export interface FeeConfig {
  type: 'percent' | 'flat'
  value: number
  label?: string
}

export interface AppConfig {
  platform_fee?: FeeConfig
  processing_fee_default?: FeeConfig
  tax_percent?: number
  [key: string]: unknown
}

// Fees vary by country, so /api/settings/ returns one config per country code.
export type AppConfigByCountry = Record<string, AppConfig>

interface SettingsState {
  configByCountry: AppConfigByCountry | null
  selectedCountryCode: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: SettingsState = {
  configByCountry: null,
  selectedCountryCode: 'PK',
  status: 'idle',
}

export const fetchAppConfig = createAsyncThunk('settings/fetchConfig', async () => {
  const res = await publicApi.get<{ data: AppConfigByCountry }>('/api/settings/')
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
        state.configByCountry = action.payload
      })
      .addCase(fetchAppConfig.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export const { setCountry } = settingsSlice.actions
export default settingsSlice.reducer

// Falls back to the first configured country, mirroring selectSelectedCountry.
export const selectAppConfig = (state: RootState): AppConfig | null => {
  const byCountry = state.settings.configByCountry
  if (!byCountry) return null
  return byCountry[state.settings.selectedCountryCode] ?? Object.values(byCountry)[0] ?? null
}
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
  selectAppConfig(state)?.platform_fee ?? null

export const selectProcessingFeeDefault = (state: RootState): FeeConfig | null =>
  selectAppConfig(state)?.processing_fee_default ?? null

export const selectTaxPercent = (state: RootState): number =>
  selectAppConfig(state)?.tax_percent ?? 0

// Matches the web app's default FRONTEND_URL-based path — used only if a country has no
// CountryConfig at all, so the app never ends up with nothing to match against.
const DEFAULT_CHECKOUT_SUCCESS_URL = 'https://passlay.com/checkout/success'
const DEFAULT_CHECKOUT_FAILURE_URL = 'https://passlay.com/checkout/failure'

export const selectCheckoutSuccessUrl = (state: RootState): string =>
  (selectAppConfig(state)?.success_url as string) || DEFAULT_CHECKOUT_SUCCESS_URL

export const selectCheckoutFailureUrl = (state: RootState): string =>
  (selectAppConfig(state)?.failure_url as string) || DEFAULT_CHECKOUT_FAILURE_URL
