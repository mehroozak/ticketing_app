import React from 'react'
import { Image, Pressable, View } from 'react-native'
import { Card, CardContent } from '../ui/card'
import { Text } from '../ui/text'
import { displayDateTime } from '../../lib/dateUtils'
import type { AssignedEvent } from '../../types/events'

interface AssignedEventCardProps {
  event: AssignedEvent
  onPress: () => void
}

export default function AssignedEventCard({ event, onPress }: AssignedEventCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className="overflow-hidden py-0">
        {event.banner?.url && (
          <Image source={{ uri: event.banner.url }} className="w-full h-32" resizeMode="cover" />
        )}
        <CardContent className="px-4 py-4 gap-1">
          <Text className="text-foreground text-base font-semibold" numberOfLines={1}>
            {event.name}
          </Text>
          {!!event.venue_name && (
            <Text className="text-muted-foreground text-sm" numberOfLines={1}>
              {event.venue_name}
              {event.city ? `, ${event.city.display_name ?? event.city.value}` : ''}
            </Text>
          )}
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-muted-foreground text-xs">{displayDateTime(event.start_datetime)}</Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}
