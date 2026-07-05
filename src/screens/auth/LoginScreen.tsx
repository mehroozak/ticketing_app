import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import LoginForm from '../../components/auth/LoginForm'

export default function LoginScreen() {
  return (
    // bg-background lives on this plain View — SafeAreaView is only used for its inset behavior,
    // since its cssInterop-wrapped className doesn't re-resolve dark-mode CSS variables reactively
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerClassName="flex-1 justify-center px-6 py-10"
            keyboardShouldPersistTaps="handled"
          >
            <LoginForm />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
