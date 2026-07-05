import React from 'react'
import { View, Text } from 'react-native'
import type { ExploreStackScreenProps } from '../../navigation/types'

type Props = ExploreStackScreenProps<'Checkout'>

export default function CheckoutScreen({ route }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-lg font-semibold">Checkout</Text>
      <Text className="text-muted-foreground text-sm mt-1">Event: {route.params.eventId}</Text>
    </View>
  )
}
