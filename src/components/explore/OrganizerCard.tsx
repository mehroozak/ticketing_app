import React from 'react'
import { Image, Pressable, View } from 'react-native'
import { CalendarCheck, MapPin } from 'lucide-react-native'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'
import type { PublicOrganizer } from '../../types/events'

interface Props {
  organizer: PublicOrganizer
  onPress: () => void
}

export default function OrganizerCard({ organizer, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="aspect-[4/4.5] rounded-3xl overflow-hidden border border-white/10 bg-black"
    >
      {organizer.logo ? (
        <Image source={{ uri: organizer.logo }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
      ) : (
        <View className="absolute inset-0 bg-muted" />
      )}
      <View className="absolute inset-0 bg-black/60" />

      <View className="flex-1 items-center justify-center px-5 py-4">
        <Text
          className="text-center text-3xl font-extrabold uppercase leading-none text-white"
          numberOfLines={2}
        >
          {organizer.organization_name}
        </Text>
        <View className="my-3 h-0.5 w-12 rounded-full bg-brand" />

        <View className="flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {organizer.city ? (
            <View className="flex-row items-center gap-1.5">
              <Icon as={MapPin} size={14} className="text-brand" />
              <Text className="text-xs text-white/80">{organizer.city}</Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-1.5">
            <Icon as={CalendarCheck} size={14} className="text-brand" />
            <Text className="text-xs text-white/80">
              {organizer.events_hosted} {organizer.events_hosted === 1 ? 'event' : 'events'} hosted
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}
