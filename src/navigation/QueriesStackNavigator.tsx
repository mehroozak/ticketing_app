import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { QueriesStackParamList } from './types'
import QueriesScreen from '../screens/queries/QueriesScreen'
import EnquireArtistScreen from '../screens/queries/EnquireArtistScreen'
import EnquireEventManagementScreen from '../screens/queries/EnquireEventManagementScreen'
import ContactUsScreen from '../screens/queries/ContactUsScreen'

const Stack = createNativeStackNavigator<QueriesStackParamList>()

export default function QueriesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QueriesScreen" component={QueriesScreen} />
      <Stack.Screen name="EnquireArtist" component={EnquireArtistScreen} />
      <Stack.Screen name="EnquireEventManagement" component={EnquireEventManagementScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
    </Stack.Navigator>
  )
}
