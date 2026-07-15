import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import EnquiryForm from '../../components/queries/EnquiryForm'
import type { QueriesStackScreenProps } from '../../navigation/types'

type Props = QueriesStackScreenProps<'EnquireEventManagement'>

export default function EnquireEventManagementScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          Event Management
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-4 py-4 gap-4" keyboardShouldPersistTaps="handled">
        <Text className="text-muted-foreground text-sm">
          Looking for full event management? Share the details below and we'll follow up with a quote.
        </Text>
        <EnquiryForm
          enquiryType="event_management"
          messagePlaceholder="What kind of event, expected guest count, and venue (if decided)?"
        />
      </ScrollView>
    </SafeAreaView>
  )
}
