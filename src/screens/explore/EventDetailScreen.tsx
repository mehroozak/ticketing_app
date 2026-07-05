import React from 'react'
import { View, Text } from 'react-native'
import type { ExploreStackScreenProps } from '../../navigation/types'

type Props = ExploreStackScreenProps<'EventDetail'>

export default function EventDetailScreen({ route }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-lg font-semibold">Event Detail</Text>
      <Text className="text-muted-foreground text-sm mt-1">ID: {route.params.id}</Text>
    </View>
  )
}
