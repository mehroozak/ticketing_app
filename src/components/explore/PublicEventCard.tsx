import React from 'react'
import { Image, Pressable, View } from 'react-native'
import { Calendar, Clock, MapPin } from 'lucide-react-native'
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
    <Pressable onPress={onPress} className="rounded-2xl overflow-hidden">
      <View className="aspect-[4/5] bg-muted">
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

        <View className="absolute bottom-0 left-0 right-0 bg-black/65 px-4 py-3">
          <Text className="text-white text-base font-semibold uppercase leading-tight mb-2" numberOfLines={2}>
            {event.name}
          </Text>

          <View className="flex-row items-end justify-between gap-2">
            <View className="gap-1">
              {event.start_datetime && (
                <>
                  <View className="flex-row items-center gap-1.5">
                    <Icon as={Calendar} size={12} className="text-white/80" />
                    <Text className="text-white/80 text-xs">{displayDate(event.start_datetime)}</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Icon as={Clock} size={12} className="text-white/80" />
                    <Text className="text-white/80 text-xs">{displayTime(event.start_datetime)}</Text>
                  </View>
                </>
              )}
              {event.city && (
                <View className="flex-row items-center gap-1.5">
                  <Icon as={MapPin} size={12} className="text-white/80" />
                  <Text className="text-white/80 text-xs">{event.city.display_name}</Text>
                </View>
              )}
            </View>

            {event.min_price != null && (
              <View className="items-end shrink-0">
                <Text className="text-white/60 text-[10px] uppercase tracking-widest">From</Text>
                <Text className="text-white text-base font-bold">{event.min_price}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  )
}
