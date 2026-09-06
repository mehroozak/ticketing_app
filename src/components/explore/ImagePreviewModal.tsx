import React from 'react'
import { Image, Modal, Pressable, useWindowDimensions } from 'react-native'
import { X } from 'lucide-react-native'
import { Icon } from '../ui/icon'

interface Props {
  visible: boolean
  onClose: () => void
  uri: string | null
}

export default function ImagePreviewModal({ visible, onClose, uri }: Props) {
  const { width, height } = useWindowDimensions()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/90">
        <Pressable onPress={onClose} hitSlop={12} className="absolute right-4 top-12 z-10">
          <Icon as={X} size={26} className="text-white" />
        </Pressable>
        {uri && (
          <Image
            source={{ uri }}
            style={{ width, height: height * 0.8 }}
            resizeMode="contain"
          />
        )}
      </Pressable>
    </Modal>
  )
}
