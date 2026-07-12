import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { secureApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import type { AssignedEvent } from '../../types/events'
import type { RootState } from '../index'
import { logout } from './authSlice'

interface AssignedEventsState {
  events: AssignedEvent[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: AssignedEventsState = {
  events: [],
  status: 'idle',
}

export const fetchAssignedEvents = createAsyncThunk(
  'assignedEvents/fetchAll',
  async (organizationId: number) => {
    const res = await secureApi.get<{ data: AssignedEvent[] }>(END_POINTS.STAFF_ASSIGNED_EVENTS, {
      params: { organization: organizationId },
    })
    return res.data.data
  },
)

const assignedEventsSlice = createSlice({
  name: 'assignedEvents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignedEvents.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAssignedEvents.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.events = action.payload
      })
      .addCase(fetchAssignedEvents.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(logout, () => initialState)
  },
})

export default assignedEventsSlice.reducer

export const selectAssignedEvents = (state: RootState) => state.assignedEvents.events
export const selectAssignedEventsStatus = (state: RootState) => state.assignedEvents.status
