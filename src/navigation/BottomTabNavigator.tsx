import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTheme } from '@react-navigation/native'
import { House, Search, CircleQuestionMark, KeyRound, LayoutDashboard } from 'lucide-react-native'
import type { BottomTabParamList } from './types'
import { BRAND_COLOR, MUTED_FOREGROUND } from '../lib/nav-theme'
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import HomeScreen from '../screens/home/HomeScreen'
import ExploreStackNavigator from './ExploreStackNavigator'
import QueriesStackNavigator from './QueriesStackNavigator'
import PortalTab from './PortalTab'

const Tab = createBottomTabNavigator<BottomTabParamList>()

export default function BottomTabNavigator() {
  const { colors, dark } = useTheme()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: dark ? MUTED_FOREGROUND.dark : MUTED_FOREGROUND.light,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{ tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Queries"
        component={QueriesStackNavigator}
        options={{ tabBarIcon: ({ color, size }) => <CircleQuestionMark color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Portal"
        component={PortalTab}
        options={{
          tabBarLabel: isAuthenticated ? 'Portal' : 'Login',
          tabBarIcon: ({ color, size }) =>
            isAuthenticated ? (
              <LayoutDashboard color={color} size={size} />
            ) : (
              <KeyRound color={color} size={size} />
            ),
        }}
      />
    </Tab.Navigator>
  )
}
