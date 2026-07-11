import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
}

const initialState: ThemeState = {
  mode: 'dark',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload
    },
    resetTheme() {
      return initialState
    },
  },
})

export const { setTheme, resetTheme } = themeSlice.actions

export const selectThemeMode = (state: RootState) => state.theme.mode

export default themeSlice.reducer
