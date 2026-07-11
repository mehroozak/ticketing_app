import React from 'react'
import { View } from 'react-native'
import { Text } from '../../../components/ui/text'
import type { StaffStackScreenProps } from '../../../navigation/types'

type Props = StaffStackScreenProps<'EventCheckin'>

export default function EventCheckinScreen({ route }: Props) {
  const { eventName } = route.params

  return (
    <View className="flex-1 bg-background p-6 gap-6">
      <View className="gap-1">
        <Text variant="h2">{eventName}</Text>
      </View>
    </View>
  )
}
