import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { ChevronUp, Sparkles } from 'lucide-react-native'
import { Icon } from '../ui/icon'
import { Text } from '../ui/text'

export default function AgentSheet() {
  const sheetRef = useRef<BottomSheet>(null)
  const [isPeek, setIsPeek] = useState(true)
  const snapPoints = useMemo(() => ['12%', '92%'], [])

  const expand = useCallback(() => {
    sheetRef.current?.snapToIndex(1)
  }, [])

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={1} disappearsOnIndex={0} pressBehavior="collapse" />
    ),
    [],
  )

  const renderHandle = useCallback(
    () => (
      <View className="items-center justify-center py-3">
        <Icon as={ChevronUp} size={20} className="text-muted-foreground" />
      </View>
    ),
    [],
  )

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onChange={(index) => setIsPeek(index === 0)}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      backgroundStyle={{ backgroundColor: 'transparent' }}
    >
      <BottomSheetView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View className="flex-1 bg-background rounded-t-3xl border border-brand ">
          {isPeek && (
            <Pressable onPress={expand} className="flex-row items-center justify-center gap-2 px-6 py-2">
              <Icon as={Sparkles} size={18} className="text-brand" />
              <Text className="text-foreground text-sm font-semibold">Getting bored? Talk to Jerry</Text>
            </Pressable>
          )}

          <View className="flex-1 items-center justify-center gap-2 px-6">
            <Text className="text-foreground text-lg font-semibold">Coming soon</Text>
            <Text className="text-muted-foreground text-sm text-center">
              Your AI event assistant is on the way.
            </Text>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  )
}
