import React from 'react'
import { View } from 'react-native'
import { XCircle } from 'lucide-react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { Icon } from '../../components/ui/icon'
import { Text } from '../../components/ui/text'
import { Button } from '../../components/ui/button'
import type { ExploreStackScreenProps } from '../../navigation/types'

type Props = ExploreStackScreenProps<'PaymentFailure'>

// No network call — pending/unpaid orders are cleaned up by a separate cron, not from here.
export default function PaymentFailureScreen({ navigation, route }: Props) {
  const { errMsg } = route.params
  const message = errMsg || 'Your payment could not be completed. You have not been charged.'

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6" edges={['top']}>
      <View className="items-center gap-4">
        <Icon as={XCircle} size={40} className="text-destructive" />
        <Text variant="h2" className="text-center">
          Payment failed
        </Text>
        <Text className="text-muted-foreground text-sm text-center">{message}</Text>
        <Button variant="outline" onPress={() => navigation.popToTop()}>
          <Text>Browse events</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
