import React from 'react'
import { Image, Pressable, View } from 'react-native'
import { Images } from 'lucide-react-native'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'

interface Props {
  name: string
  cover: string
  photoCount: number
  onPress: () => void
}

export default function EventGalleryAlbumCard({ name, cover, photoCount, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="aspect-square w-[48%] overflow-hidden rounded-lg bg-muted">
      <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" />
      <View className="absolute inset-x-0 bottom-0 gap-0.5 bg-black/60 p-2.5">
        <Text className="text-sm font-semibold uppercase tracking-wide text-white" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Icon as={Images} size={12} className="text-white/70" />
          <Text className="text-xs text-white/70">
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
