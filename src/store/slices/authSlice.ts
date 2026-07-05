import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { User, OrganizationMembership } from '../../types/auth'

interface AuthState {
  user: User | null
  organizations: OrganizationMembership[]
  access: string | null
  refresh: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  organizations: [],
  access: null,
  refresh: null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; access: string; refresh: string; organizations?: OrganizationMembership[] }>,
    ) {
      state.user = action.payload.user
      state.access = action.payload.access
      state.refresh = action.payload.refresh
      if (action.payload.organizations !== undefined) {
        state.organizations = action.payload.organizations
      }
      state.error = null
    },

    setAccessToken(state, action: PayloadAction<string>) {
      state.access = action.payload
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },

    clearError(state) {
      state.error = null
    },

    addOrganization(state, action: PayloadAction<OrganizationMembership>) {
      state.organizations = [...state.organizations, action.payload]
    },

    logout() {
      return initialState
    },
  },
})

export const {
  setCredentials,
  setAccessToken,
  updateUser,
  setLoading,
  setError,
  clearError,
  addOrganization,
  logout,
} = authSlice.actions

export const selectAuth = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectAccess = (state: RootState) => state.auth.access
export const selectRefresh = (state: RootState) => state.auth.refresh
export const selectIsLoading = (state: RootState) => state.auth.isLoading
export const selectError = (state: RootState) => state.auth.error
export const selectIsAuthenticated = (state: RootState) => !!state.auth.access
export const selectOrganizations = (state: RootState) => state.auth.organizations
export const selectHasOrganizations = (state: RootState) => state.auth.organizations?.length > 0
export const selectUserFullName = (state: RootState) => {
  const user = state.auth.user
  if (!user) return null
  const full = `${user.first_name} ${user.last_name}`.trim()
  return full || user.email
}

export default authSlice.reducer
