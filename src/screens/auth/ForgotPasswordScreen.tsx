import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { SafeAreaView } from '../../components/ui/safe-area-view'
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm'

export default function ForgotPasswordScreen() {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerClassName="flex-1 justify-center px-6 py-10"
            keyboardShouldPersistTaps="handled"
          >
            <ForgotPasswordForm />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
