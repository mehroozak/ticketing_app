import React from 'react'
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import SignupForm from '../../components/auth/SignupForm'
import { useAppDispatch } from '../../store/hooks'
import { fetchAllLookups } from '../../store/slices/lookupsSlice'
import { fetchAppConfig } from '../../store/slices/settingsSlice'

export default function SignupScreen() {
  const dispatch = useAppDispatch()
  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([dispatch(fetchAllLookups()), dispatch(fetchAppConfig())])
    setRefreshing(false)
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerClassName="px-6 py-10"
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            <SignupForm />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
