import React from 'react'
import { View, Text } from 'react-native'
import type { StaffStackScreenProps } from '../../../navigation/types'

type Props = StaffStackScreenProps<'EventCheckin'>

export default function EventCheckinScreen({ route }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-lg font-semibold">{route.params.eventName}</Text>
      <Text className="text-muted-foreground text-sm mt-1">Start Scanning  |  View Scan Log</Text>
    </View>
  )
}
