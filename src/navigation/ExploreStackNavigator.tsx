import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { ExploreStackParamList } from './types'
import ExploreScreen from '../screens/explore/ExploreScreen'
import EventDetailScreen from '../screens/explore/EventDetailScreen'
import OrganizersScreen from '../screens/explore/OrganizersScreen'
import OrganizerProfileScreen from '../screens/explore/OrganizerProfileScreen'
import CheckoutScreen from '../screens/checkout/CheckoutScreen'
import ConfirmationScreen from '../screens/checkout/ConfirmationScreen'
import PaymentCheckoutScreen from '../screens/checkout/PaymentCheckoutScreen'
import PaymentFailureScreen from '../screens/checkout/PaymentFailureScreen'

const Stack = createNativeStackNavigator<ExploreStackParamList>()

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Organizers" component={OrganizersScreen} />
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfileScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <Stack.Screen name="PaymentFailure" component={PaymentFailureScreen} />
    </Stack.Navigator>
  )
}
