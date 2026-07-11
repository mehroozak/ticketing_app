import React from 'react'
import { View } from 'react-native'
import { Text } from '../../../components/ui/text'

export default function AssignedEventsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-foreground text-lg font-semibold">Assigned events</Text>
      <Text className="text-muted-foreground text-sm mt-1 text-center">Coming soon.</Text>
    </View>
  )
}
