import React from 'react'
import { Image, Pressable, View } from 'react-native'
import { Calendar, ChevronRight, MapPin } from 'lucide-react-native'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'
import { displayDayMonth, displayTime } from '../../lib/dateUtils'
import type { PublicEvent } from '../../types/events'

interface Props {
  event: PublicEvent
  onPress: () => void
  isPast?: boolean
}

export default function PublicEventCard({ event, onPress, isPast = false }: Props) {
  const banner = event.banners[0]
  const category = event.categories[0]

  const nameWords = event.name.trim().split(/\s+/)
  const nameLastWord = nameWords.pop() ?? ''
  const nameLead = nameWords.join(' ')

  const location = [event.venue_name, event.city?.display_name].filter(Boolean).join(', ')

  return (
    <Pressable
      onPress={onPress}
      className="aspect-[4/4.5] rounded-3xl overflow-hidden border border-white/10 bg-black"
    >
      {banner ? (
        <Image source={{ uri: banner }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
      ) : (
        <View className="absolute inset-0 bg-muted" />
      )}
      <View className="absolute inset-0 bg-black/60" />

      <View className="flex-1 p-5">
        {/* Top row: category + date */}
        <View className="flex-row items-start">
          {category && (
            <View className="rounded-full border border-brand/70 bg-black/30 px-3 py-1">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-brand">
                {category.display_name}
              </Text>
            </View>
          )}
          {event.start_datetime && (
            <Text className="ml-auto text-sm font-bold uppercase text-white">
              {displayDayMonth(event.start_datetime)}
            </Text>
          )}
        </View>

        {/* Headline */}
        <View className="flex-1 items-center justify-center px-1 py-4">
          <Text className="text-center text-3xl font-extrabold uppercase leading-none text-white" numberOfLines={2}>
            {nameLead ? `${nameLead}\n` : ''}
            <Text className="text-3xl font-extrabold uppercase leading-none text-brand">{nameLastWord}</Text>
          </Text>
          <View className="my-3 h-0.5 w-12 rounded-full bg-brand" />
          {location ? (
            <Text className="text-center text-xs uppercase tracking-widest text-white/70" numberOfLines={1}>
              {location}
            </Text>
          ) : null}
        </View>

        {/* Meta + CTA */}
        <View className="gap-4">
          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
            {event.start_datetime && (
              <View className="flex-row items-center gap-1.5">
                <Icon as={Calendar} size={14} className="text-brand" />
                <Text className="text-xs text-white/80">{displayTime(event.start_datetime)}</Text>
              </View>
            )}
            {event.city && (
              <View className="flex-row items-center gap-1.5">
                <Icon as={MapPin} size={14} className="text-brand" />
                <Text className="text-xs text-white/80">{event.city.display_name}</Text>
              </View>
            )}
          </View>

          {!isPast && (
            <View className="h-11 flex-row items-center justify-between rounded-full bg-brand px-5">
              <Text className="text-sm font-bold uppercase tracking-widest text-background">Book Pass</Text>
              <Icon as={ChevronRight} size={16} className="text-background" />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}
