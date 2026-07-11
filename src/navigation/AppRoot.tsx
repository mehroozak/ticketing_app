import React, { useEffect, useState } from 'react'
import { StatusBar, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'
import Toast from 'react-native-toast-message'
import { PortalHost } from '@rn-primitives/portal'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Settings as FacebookSettings } from 'react-native-fbsdk-next'
import Config from 'react-native-config'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectThemeMode } from '../store/slices/themeSlice'
import { fetchAllLookups } from '../store/slices/lookupsSlice'
import { fetchAppConfig } from '../store/slices/settingsSlice'
import { ensureDeviceId } from '../store/slices/checkinSlice'
import { NAV_THEME } from '../lib/nav-theme'
import RootNavigator from './RootNavigator'
import AnimatedSplash from '../components/AnimatedSplash'

export default function AppRoot() {
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector(selectThemeMode)
  const { colorScheme, setColorScheme } = useNativeWindColorScheme()
  const [bootDataReady, setBootDataReady] = useState(false)
  const [splashHidden, setSplashHidden] = useState(false)

  useEffect(() => {
    setColorScheme(themeMode)
  }, [themeMode, setColorScheme])

  useEffect(() => {
    async function loadBootData() {
      // Splash stays up until both resolve — the app isn't usable without lookups/config,
      // however long the API takes.
      await Promise.all([dispatch(fetchAllLookups()), dispatch(fetchAppConfig())])
      setBootDataReady(true)
    }

    dispatch(ensureDeviceId())
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
    })
    // Facebook SDK v9+ removed iOS auto-init; safe to call on Android too (already auto-inits there)
    FacebookSettings.initializeSDK()
    loadBootData()
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
        <Toast position='top'/>
        <PortalHost />
      </SafeAreaProvider>
      {!splashHidden && (
        <AnimatedSplash ready={bootDataReady} onAnimationEnd={() => setSplashHidden(true)} />
      )}
    </View>
  )
}
