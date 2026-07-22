import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { RootStackParamList } from './types'
import BottomTabNavigator from './BottomTabNavigator'
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      {/* TODO: not deep-link-reachable yet — needs a NavigationContainer `linking` config plus
          Android intent-filter/assetlinks.json and iOS Associated Domains entitlement. iOS side is
          blocked on purchasing the paid Apple Developer Program (personal team can't use Associated
          Domains); wire both together once that's done. */}
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  )
}
