import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import EnquiryForm from '../../components/queries/EnquiryForm'
import type { QueriesStackScreenProps } from '../../navigation/types'

type Props = QueriesStackScreenProps<'ContactSupport'>

export default function ContactSupportScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="relative flex-row items-center justify-center px-12 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="absolute left-4">
          <Icon as={ChevronLeft} size={24} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="text-center">
          Contact Support
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-4 py-4 gap-4" keyboardShouldPersistTaps="handled">
        <Text className="text-muted-foreground text-sm">
          Having an issue with an order or ticket? Let us know the details and we'll help sort it out.
        </Text>
        <EnquiryForm enquiryType="contact_support" messagePlaceholder="What's going wrong?" />
      </ScrollView>
    </SafeAreaView>
  )
}
