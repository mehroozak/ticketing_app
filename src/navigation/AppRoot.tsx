import React, { useEffect } from 'react'
import { StatusBar, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import Toast from 'react-native-toast-message'
import { PortalHost } from '@rn-primitives/portal'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectThemeMode } from '../store/slices/themeSlice'
import { fetchAllLookups } from '../store/slices/lookupsSlice'
import { fetchAppConfig } from '../store/slices/settingsSlice'
import { NAV_THEME } from '../lib/nav-theme'
import RootNavigator from './RootNavigator'

export default function AppRoot() {
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector(selectThemeMode)
  const { colorScheme, setColorScheme } = useNativeWindColorScheme()

  useEffect(() => {
    setColorScheme(themeMode)
  }, [themeMode, setColorScheme])

  useEffect(() => {
    dispatch(fetchAllLookups())
    dispatch(fetchAppConfig())
  }, [dispatch])

  const isDark = colorScheme === 'dark'

  return (
    // NativeWind's darkMode: 'class' strategy needs a literal `dark` class on an ancestor
    // to activate .dark-scoped CSS variables — setColorScheme() alone doesn't reliably do this
    <View className={isDark ? 'dark flex-1' : 'flex-1'}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <NavigationContainer theme={isDark ? NAV_THEME.dark : NAV_THEME.light}>
          <RootNavigator />
        </NavigationContainer>
        <Toast />
        <PortalHost />
      </SafeAreaProvider>
    </View>
  )
}
