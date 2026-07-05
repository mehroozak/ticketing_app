import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { OrganizationMembership } from '../../types/auth'
import { logout } from './authSlice'

// Mobile contexts: personal (customer browsing + tickets) or gate_staff (event scanner)
export type ActiveContext = 'personal' | 'gate_staff'

interface ContextState {
  activeContext: ActiveContext
  // Which org the user is currently scanning for (null when in personal context)
  activeOrganization: OrganizationMembership | null
}

const initialState: ContextState = {
  activeContext: 'personal',
  activeOrganization: null,
}

const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setContext(state, action: PayloadAction<ActiveContext>) {
      state.activeContext = action.payload
    },

    // Switch to a specific org's gate staff context (user picks from context switcher)
    setContextAndOrg(state, action: PayloadAction<OrganizationMembership>) {
      state.activeContext = 'gate_staff'
      state.activeOrganization = action.payload
    },

    switchToPersonal(state) {
      state.activeContext = 'personal'
      state.activeOrganization = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const { setContext, setContextAndOrg, switchToPersonal } = contextSlice.actions

export const selectActiveContext = (state: RootState) => state.context.activeContext
export const selectActiveOrganization = (state: RootState) => state.context.activeOrganization
export const selectIsGateStaff = (state: RootState) => state.context.activeContext === 'gate_staff'

// All orgs where this user is gate_staff — used to populate the context switcher
export const selectGateStaffMemberships = (state: RootState) =>
  state.auth.organizations.filter((m) => m.role === 'org_staff')

export default contextSlice.reducer
