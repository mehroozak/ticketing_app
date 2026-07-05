import React, { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer'
import type { PortalDrawerParamList } from './types'
import type { OrganizationMembership } from '../types/auth'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  selectActiveContext,
  selectActiveOrganization,
  selectGateStaffMemberships,
  setContextAndOrg,
  switchToPersonal,
} from '../store/slices/contextSlice'
import { selectUser, logout } from '../store/slices/authSlice'
import MyTicketsScreen from '../screens/portal/user/MyTicketsScreen'
import ProfileScreen from '../screens/portal/user/ProfileScreen'
import StaffStackNavigator from './StaffStackNavigator'

const Drawer = createDrawerNavigator<PortalDrawerParamList>()

function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const activeContext = useAppSelector(selectActiveContext)
  const activeOrg = useAppSelector(selectActiveOrganization)
  const gateStaffMemberships = useAppSelector(selectGateStaffMemberships)
  const [showPicker, setShowPicker] = useState(false)

  // Auto-navigate to the correct initial screen when context switches
  useEffect(() => {
    if (activeContext === 'gate_staff') {
      navigation.navigate('Staff')
    } else {
      navigation.navigate('MyTickets')
    }
  }, [activeContext])

  const handleSelectPersonal = () => {
    dispatch(switchToPersonal())
    setShowPicker(false)
  }

  const handleSelectOrg = (membership: OrganizationMembership) => {
    dispatch(setContextAndOrg(membership))
    setShowPicker(false)
  }

  const contextLabel =
    activeContext === 'personal'
      ? 'Personal'
      : (activeOrg?.organization.organization_name ?? 'Staff')

  return (
    <View className="flex-1 bg-background">
      <DrawerContentScrollView scrollEnabled={false}>
        {/* ── User info + context switcher ─────────────────────────── */}
        <View className="px-4 pt-8 pb-4 border-b border-border">
          <Text className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            {user?.first_name} {user?.last_name}
          </Text>

          <Pressable
            onPress={() => setShowPicker((v) => !v)}
            className="flex-row items-center justify-between bg-muted rounded-xl px-4 py-3"
          >
            <Text className="text-foreground font-semibold">{contextLabel}</Text>
            <Text className="text-muted-foreground text-xs">{showPicker ? '▴' : '▾'}</Text>
          </Pressable>

          {showPicker && (
            <View className="mt-1 bg-card border border-border rounded-xl overflow-hidden">
              <Pressable
                onPress={handleSelectPersonal}
                className="px-4 py-3 border-b border-border"
              >
                <Text
                  className={`text-sm ${
                    activeContext === 'personal'
                      ? 'text-brand font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  Personal
                </Text>
              </Pressable>

              {gateStaffMemberships.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => handleSelectOrg(m)}
                  className="px-4 py-3 border-b border-border last:border-b-0"
                >
                  <Text
                    className={`text-sm ${
                      activeOrg?.id === m.id && activeContext === 'gate_staff'
                        ? 'text-brand font-semibold'
                        : 'text-foreground'
                    }`}
                  >
                    {m.organization.organization_name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Context-aware menu items ──────────────────────────────── */}
        <View className="px-2 pt-2">
          {activeContext === 'personal' ? (
            <>
              <Pressable
                onPress={() => navigation.navigate('MyTickets')}
                className="flex-row items-center px-4 py-3.5 rounded-xl"
              >
                <Text className="text-foreground text-base">My Tickets</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Profile')}
                className="flex-row items-center px-4 py-3.5 rounded-xl"
              >
                <Text className="text-foreground text-base">Profile</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => navigation.navigate('Staff')}
              className="flex-row items-center px-4 py-3.5 rounded-xl"
            >
              <Text className="text-foreground text-base">Assigned Events</Text>
            </Pressable>
          )}
        </View>
      </DrawerContentScrollView>

      {/* ── Logout pinned to bottom ───────────────────────────────── */}
      <View className="px-4 pb-10 pt-4 border-t border-border">
        <Pressable
          onPress={() => dispatch(logout())}
          className="px-4 py-3.5 rounded-xl"
        >
          <Text className="text-destructive font-semibold text-base">Logout</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function PortalDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="MyTickets" component={MyTicketsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Staff" component={StaffStackNavigator} />
    </Drawer.Navigator>
  )
}
