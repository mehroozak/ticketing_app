import React, { useState } from 'react'
import { Image, ScrollView, View, useWindowDimensions } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

interface Props {
  banners: string[]
  name: string
}

export default function BannerCarousel({ banners, name }: Props) {
  const { width } = useWindowDimensions()
  const [activeIndex, setActiveIndex] = useState(0)

  if (banners.length === 0) return null

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(idx)
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {banners.map((url, idx) => (
          <Image
            key={idx}
            source={{ uri: url }}
            style={{ width }}
            className="aspect-[16/9]"
            resizeMode="cover"
            accessibilityLabel={`${name} ${idx + 1}`}
          />
        ))}
      </ScrollView>

      {banners.length > 1 && (
        <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-1.5">
          {banners.map((_, idx) => (
            <View
              key={idx}
              className={`h-1.5 rounded-full ${idx === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </View>
      )}
    </View>
  )
}
