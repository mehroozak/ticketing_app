import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { WebView, type WebViewNavigation } from 'react-native-webview'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import { buildAutoSubmitHtml } from '../../lib/gateway'
import { useAppSelector } from '../../store/hooks'
import { selectCheckoutFailureUrl, selectCheckoutSuccessUrl } from '../../store/slices/settingsSlice'
import type { PaymentCheckoutScreenProps } from '../../navigation/types'

type Props = PaymentCheckoutScreenProps

export default function PaymentCheckoutScreen({ navigation, route }: Props) {
  const { orderId, postUrl, fields } = route.params
  const [isLoading, setIsLoading] = useState(true)

  // Mid-payment isn't a place to let the customer tab away to — hide the bottom tabs while
  // this screen is on top, same pattern OrderDetailScreen uses for the drawer header.
  useEffect(() => {
    const parent = navigation.getParent()
    parent?.setOptions({ tabBarStyle: { display: 'none' } })
    return () => parent?.setOptions({ tabBarStyle: undefined })
  }, [navigation])

  // Sourced from the country config fetched at app boot (same place fees come from), with a
  // hardcoded fallback if that country has none set. Intercepted client-side before either
  // ever loads, so nothing here needs to actually be reachable.
  const successUrl = useAppSelector(selectCheckoutSuccessUrl)
  const failureUrl = useAppSelector(selectCheckoutFailureUrl)

  function handleShouldStartLoad(request: WebViewNavigation): boolean {
    const { url } = request
    if (url.startsWith(successUrl)) {
      navigation.replace('Confirmation', { orderId })
      return false
    }
    if (url.startsWith(failureUrl)) {
      const params = parseQueryParams(url)
      navigation.replace('PaymentFailure', { errMsg: params.err_msg })
      return false
    }
    return true
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {isLoading && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-background">
          <ActivityIndicator />
        </View>
      )}
      <WebView
        source={{ html: buildAutoSubmitHtml(postUrl, fields), baseUrl: postUrl }}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onLoadEnd={() => setIsLoading(false)}
        originWhitelist={['*']}
      />
    </SafeAreaView>
  )
}

function parseQueryParams(url: string): Record<string, string> {
  const query = url.split('?')[1] ?? ''
  return Object.fromEntries(new URLSearchParams(query))
}
