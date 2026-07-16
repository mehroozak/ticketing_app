import React from 'react'
import { ScrollView, View } from 'react-native'
import PublicEventCard from '../explore/PublicEventCard'
import type { PublicEvent } from '../../types/events'

interface Props {
  events: PublicEvent[]
  onPressEvent: (event: PublicEvent) => void
}

export default function EventRow({ events, onPressEvent }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 pr-4"
    >
      {events.map((event) => (
        <View key={event.id} className="w-72">
          <PublicEventCard event={event} onPress={() => onPressEvent(event)} />
        </View>
      ))}
    </ScrollView>
  )
}
