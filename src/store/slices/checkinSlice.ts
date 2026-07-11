import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../index'

interface CheckinState {
  deviceId: string
}

const generateDeviceId = () => `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

const checkinSlice = createSlice({
  name: 'checkin',
  initialState: { deviceId: '' } as CheckinState,
  reducers: {
    ensureDeviceId(state) {
      if (!state.deviceId) {
        state.deviceId = generateDeviceId()
      }
    },
  },
})

export const { ensureDeviceId } = checkinSlice.actions
export default checkinSlice.reducer

export const selectDeviceId = (state: RootState) => state.checkin.deviceId
