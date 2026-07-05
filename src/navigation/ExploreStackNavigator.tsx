import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { ExploreStackParamList } from './types'
import ExploreScreen from '../screens/explore/ExploreScreen'
import EventDetailScreen from '../screens/explore/EventDetailScreen'
import CheckoutScreen from '../screens/checkout/CheckoutScreen'
import ConfirmationScreen from '../screens/checkout/ConfirmationScreen'

const Stack = createNativeStackNavigator<ExploreStackParamList>()

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
    </Stack.Navigator>
  )
}
