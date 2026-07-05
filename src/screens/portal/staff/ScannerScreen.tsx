import React from 'react'
import { View, Text } from 'react-native'
import type { StaffStackScreenProps } from '../../../navigation/types'

type Props = StaffStackScreenProps<'Scanner'>

export default function ScannerScreen({ route }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-lg font-semibold">QR Scanner</Text>
      <Text className="text-muted-foreground text-sm mt-1">{route.params.eventName}</Text>
    </View>
  )
}
