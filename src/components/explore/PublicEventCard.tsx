import React from 'react'
import { Image, Pressable, View } from 'react-native'
import { Calendar, MapPin } from 'lucide-react-native'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'
import { displayDate, displayTime } from '../../lib/dateUtils'
import type { PublicEvent } from '../../types/events'

interface Props {
  event: PublicEvent
  onPress: () => void
}

export default function PublicEventCard({ event, onPress }: Props) {
  const banner = event.banners[0]

  return (
    <Pressable onPress={onPress} className="rounded-2xl overflow-hidden border-[0.5px] border-brand bg-background">
      <View className="aspect-[16/9] bg-muted border-b-[0.5px] border-brand">
        {banner ? (
          <Image source={{ uri: banner }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
        ) : null}

        {event.categories.length > 0 && (
          <View className="absolute top-3 left-3 flex-row flex-wrap gap-1">
            {event.categories.slice(0, 2).map((cat) => (
              <View key={cat.id} className="rounded-full bg-black/40 px-2 py-0.5">
                <Text className="text-[10px] uppercase tracking-widest text-white/90">{cat.display_name}</Text>
              </View>
            ))}
          </View>
        )}

        {event.min_price != null && (
          <View className="absolute top-3 right-3 rounded-full bg-black/40 px-2 py-0.5">
            <Text className="text-[10px] uppercase tracking-widest text-white/90">From {event.min_price}</Text>
          </View>
        )}
      </View>

      <View className="px-3 py-2">
        <Text className="text-foreground text-base font-semibold uppercase leading-tight" numberOfLines={2}>
          {event.name}
        </Text>

        <View className="flex-row items-center flex-wrap gap-x-2">
          {event.start_datetime && (
            <View className="flex-row items-center gap-1">
              <Icon as={Calendar} size={12} className="text-brand" />
              <Text className="text-brand text-xs">
                {displayDate(event.start_datetime)} · {displayTime(event.start_datetime)}
              </Text>
            </View>
          )}
          {event.city && (
            <View className="flex-row items-center gap-1">
              <Icon as={MapPin} size={12} className="text-brand" />
              <Text className="text-brand text-xs">{event.city.display_name}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}
