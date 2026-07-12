import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { UnknownAction } from 'redux'
import { logout } from './slices/authSlice'
import authReducer from './slices/authSlice'
import themeReducer from './slices/themeSlice'
import contextReducer from './slices/contextSlice'
import lookupsReducer from './slices/lookupsSlice'
import settingsReducer from './slices/settingsSlice'
import checkinReducer from './slices/checkinSlice'
import assignedEventsReducer from './slices/assignedEventsSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  context: contextReducer,
  lookups: lookupsReducer,
  settings: settingsReducer,
  checkin: checkinReducer,
  assignedEvents: assignedEventsReducer,
})

// Wipe entire state on logout (same pattern as web)
const appReducer = (state: ReturnType<typeof rootReducer> | undefined, action: UnknownAction) => {
  if (action.type === logout.type) {
    state = undefined
  }
  return rootReducer(state, action)
}

const persistConfig = {
  key: 'passlay',
  version: 1,
  storage: AsyncStorage,
  // lookups is excluded — always re-fetched fresh on boot
  whitelist: ['auth', 'theme', 'context', 'settings', 'checkin'],
}

const persistedReducer = persistReducer(persistConfig, appReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
