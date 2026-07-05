import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { publicApi } from '../../services/api'
import type { RootState } from '../index'

export interface LookupItem {
  id: number
  type: string
  value: string
  display_name: string | null
  code: string | null
  group: string | null
  parent: number | null
  order: number
  is_active: boolean
  extra: Record<string, unknown>
}

interface LookupsState {
  byType: Record<string, LookupItem[]>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

export const fetchAllLookups = createAsyncThunk('lookups/fetchAll', async () => {
  const res = await publicApi.get<{ data: LookupItem[] }>('/api/lookups/')
  return res.data.data
})

const lookupsSlice = createSlice({
  name: 'lookups',
  initialState: { byType: {}, status: 'idle' } as LookupsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLookups.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllLookups.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const byType: Record<string, LookupItem[]> = {}
        for (const item of action.payload) {
          if (!byType[item.type]) byType[item.type] = []
          byType[item.type].push(item)
        }
        state.byType = byType
      })
      .addCase(fetchAllLookups.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export default lookupsSlice.reducer

export const selectLookupsByType = (type: string) => (state: RootState) =>
  state.lookups?.byType[type] ?? []

export const selectLookupsLoaded = (state: RootState) =>
  state.lookups?.status === 'succeeded'
