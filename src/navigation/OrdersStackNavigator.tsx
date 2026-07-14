import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { OrdersStackParamList } from './types'
import MyTicketsScreen from '../screens/portal/user/MyTicketsScreen'
import OrderDetailScreen from '../screens/portal/user/OrderDetailScreen'

const Stack = createNativeStackNavigator<OrdersStackParamList>()

export default function OrdersStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyTicketsList" component={MyTicketsScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  )
}
