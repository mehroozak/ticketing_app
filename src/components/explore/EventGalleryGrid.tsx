import React, { useState } from 'react'
import { Image, Pressable, View } from 'react-native'
import ImagePreviewModal from './ImagePreviewModal'

interface Props {
  images: string[]
}

export default function EventGalleryGrid({ images }: Props) {
  const [previewUri, setPreviewUri] = useState<string | null>(null)

  if (images.length === 0) return null

  return (
    <View className="flex-row flex-wrap gap-3">
      {images.map((uri, i) => (
        <Pressable
          key={i}
          onPress={() => setPreviewUri(uri)}
          className="aspect-square w-[31%] overflow-hidden rounded-lg bg-muted"
        >
          <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
        </Pressable>
      ))}

      <ImagePreviewModal visible={!!previewUri} onClose={() => setPreviewUri(null)} uri={previewUri} />
    </View>
  )
}
