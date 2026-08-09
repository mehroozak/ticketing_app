import React from 'react'
import { Image, Pressable, View } from 'react-native'
import { Clock, MapPin } from 'lucide-react-native'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'
import { displayTime } from '../../lib/dateUtils'
import type { PublicEvent } from '../../types/events'

interface Props {
  event: PublicEvent
  onPress: () => void
}

export default function HappeningTodayCard({ event, onPress }: Props) {
  const banner = event.banners[0]
  const location = [event.venue_name, event.city?.display_name].filter(Boolean).join(', ')

  return (
    <Pressable onPress={onPress} className="aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
      {banner ? (
        <Image source={{ uri: banner }} className="w-full h-full" resizeMode="cover" />
      ) : null}

      {event.start_datetime && (
        <View className="absolute top-3 left-3 flex-row items-center gap-1 rounded-full border border-brand/70 bg-black/30 px-2 py-1">
          <Icon as={Clock} size={12} className="text-brand" />
          <Text className="text-xs font-medium text-brand">{displayTime(event.start_datetime)}</Text>
        </View>
      )}

      <View className="absolute bottom-0 left-0 right-0 gap-1 bg-black/60 px-3 py-2.5">
        <Text className="text-base font-bold uppercase tracking-wide text-white" numberOfLines={1}>
          {event.name}
        </Text>
        {location ? (
          <View className="flex-row items-center gap-1">
            <Icon as={MapPin} size={12} className="text-brand" />
            <Text className="text-xs text-white/80" numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}
