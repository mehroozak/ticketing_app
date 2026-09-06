import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { OrganizersStackParamList } from './types'
import OrganizersScreen from '../screens/explore/OrganizersScreen'
import OrganizerProfileScreen from '../screens/explore/OrganizerProfileScreen'
import EventDetailScreen from '../screens/explore/EventDetailScreen'
import CheckoutScreen from '../screens/checkout/CheckoutScreen'
import ConfirmationScreen from '../screens/checkout/ConfirmationScreen'
import PaymentCheckoutScreen from '../screens/checkout/PaymentCheckoutScreen'
import PaymentFailureScreen from '../screens/checkout/PaymentFailureScreen'

const Stack = createNativeStackNavigator<OrganizersStackParamList>()

export default function OrganizersStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrganizersScreen" component={OrganizersScreen} />
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfileScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <Stack.Screen name="PaymentFailure" component={PaymentFailureScreen} />
    </Stack.Navigator>
  )
}
