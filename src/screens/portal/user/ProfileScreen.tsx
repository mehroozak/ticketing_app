import React from 'react'
import { ScrollView, View } from 'react-native'
import { Text } from '../../../components/ui/text'
import ProfileForm from '../../../components/profile/ProfileForm'
import { useAppSelector } from '../../../store/hooks'
import { selectUser } from '../../../store/slices/authSlice'
import { displayDate } from '../../../lib/dateUtils'
import type { User } from '../../../types/auth'

function getInitials(user: User): string {
  const f = user.first_name?.[0] ?? ''
  const l = user.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || user.email[0].toUpperCase()
}

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function ProfileScreen() {
  const user = useAppSelector(selectUser)

  if (!user) return null

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-6 py-8 gap-8">
        {/* Header */}
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand">
            <Text className="text-xl font-semibold text-white">{getInitials(user)}</Text>
          </View>
          <View className="shrink">
            <Text variant="h3">
              {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : 'Your Profile'}
            </Text>
            <Text variant="muted">{user.email}</Text>
          </View>
        </View>

        {/* Account info */}
        <View className="gap-3 rounded-2xl border border-border p-5">
          <Text className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account</Text>
          <View className="flex-row flex-wrap gap-x-8 gap-y-4">
            <View>
              <Text className="text-xs text-muted-foreground">Role</Text>
              <Text className="mt-0.5 text-sm font-medium text-foreground">{formatRole(user.role)}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">Status</Text>
              <Text className="mt-0.5 text-sm font-medium text-foreground">{formatStatus(user.status)}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">Member since</Text>
              <Text className="mt-0.5 text-sm font-medium text-foreground">{displayDate(user.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Edit form */}
        <View className="gap-4 rounded-2xl border border-border p-5">
          <Text className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Personal Details
          </Text>
          <ProfileForm />
        </View>
      </ScrollView>
    </View>
  )
}
