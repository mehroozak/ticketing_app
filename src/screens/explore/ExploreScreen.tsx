import React from 'react'
import { View, Text } from 'react-native'

export default function ExploreScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-lg font-semibold">Explore Events</Text>
      <Text className="text-muted-foreground text-sm mt-1">Browse & filter events</Text>
    </View>
  )
}
