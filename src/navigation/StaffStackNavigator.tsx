import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { StaffStackParamList } from './types'
import AssignedEventsScreen from '../screens/portal/staff/AssignedEventsScreen'
import EventCheckinScreen from '../screens/portal/staff/EventCheckinScreen'
import ScannerScreen from '../screens/portal/staff/ScannerScreen'

const Stack = createNativeStackNavigator<StaffStackParamList>()

export default function StaffStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AssignedEvents" component={AssignedEventsScreen} />
      <Stack.Screen name="EventCheckin" component={EventCheckinScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  )
}
