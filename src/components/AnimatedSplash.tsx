import React, { useState } from 'react'
import { Animated, Image, Text } from 'react-native'
import BootSplash from 'react-native-bootsplash'
import manifest from '../../assets/bootsplash/manifest.json'

type Props = {
  ready: boolean
  onAnimationEnd: () => void
}

export default function AnimatedSplash({ ready, onAnimationEnd }: Props) {
  const [opacity] = useState(() => new Animated.Value(1))

  const { container, logo } = BootSplash.useHideAnimation({
    ready,
    manifest,
    logo: require('../../assets/bootsplash/logo.png'),
    animate: () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(onAnimationEnd)
    },
  })

  return (
    <Animated.View {...container} style={[container.style, { opacity }]}>
      <Image {...logo} />
      <Text
        style={{
          marginTop: 12,
          color: '#d6dbe4',
          fontSize: 28,
          fontWeight: '700',
          letterSpacing: 4,
        }}
      >
        PASSLAY
      </Text>
      <Text
        style={{
          position: 'absolute',
          bottom: 60,
          alignSelf: 'center',
          color: 'hsl(215, 17%, 60%)',
          fontSize: 13,
        }}
      >
        Powered by NibbleSquare
      </Text>
    </Animated.View>
  )
}
