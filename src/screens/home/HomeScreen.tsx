import React from 'react'
import { View, Text } from 'react-native'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/button'

export default function HomeScreen() {
  const dispatch = useAppDispatch()

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Text className="text-foreground text-lg font-semibold">Home</Text>
      <Text className="text-muted-foreground text-sm mt-1">AI event discovery — coming soon</Text>

      {/* TEMPORARY — dev-only, for re-testing login flows. Remove once a real Profile/logout exists. */}
      <Button variant="outline" onPress={() => dispatch(logout())}>
        <Text>Log out (dev)</Text>
      </Button>
    </View>
  )
}
