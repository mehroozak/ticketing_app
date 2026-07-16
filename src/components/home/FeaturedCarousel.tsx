import React, { useState } from 'react'
import { ScrollView, View, useWindowDimensions } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import PublicEventCard from '../explore/PublicEventCard'
import type { PublicEvent } from '../../types/events'

interface Props {
  events: PublicEvent[]
  onPressEvent: (event: PublicEvent) => void
}

export default function FeaturedCarousel({ events, onPressEvent }: Props) {
  const { width } = useWindowDimensions()
  const [activeIndex, setActiveIndex] = useState(0)

  if (events.length === 0) return null

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(idx)
  }

  return (
    <View className="gap-2">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {events.map((event) => (
          <View key={event.id} style={{ width }} className="px-4">
            <PublicEventCard event={event} onPress={() => onPressEvent(event)} />
          </View>
        ))}
      </ScrollView>

      {events.length > 1 && (
        <View className="flex-row items-center justify-center gap-1.5">
          {events.map((_, idx) => (
            <View
              key={idx}
              className={`h-1.5 rounded-full ${idx === activeIndex ? 'w-5 bg-brand' : 'w-1.5 bg-muted'}`}
            />
          ))}
        </View>
      )}
    </View>
  )
}
