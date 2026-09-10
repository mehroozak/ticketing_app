import * as React from 'react'
import { Alert, View } from 'react-native'
import axios from 'axios'
import Toast from 'react-native-toast-message'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { secureApi } from '../../services/api'
import { END_POINTS } from '../../lib/endpoints'
import { Button } from '../ui/button'
import { Text } from '../ui/text'

export default function DeleteAccountSection() {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await secureApi.delete(END_POINTS.ME, { skipErrorToast: true })
      Toast.show({ type: 'success', text1: 'Account deleted' })
      dispatch(logout())
    } catch (err) {
      setIsDeleting(false)
      const detail = axios.isAxiosError<{ errors?: { detail?: string } }>(err)
        ? err.response?.data?.errors?.detail
        : undefined
      Alert.alert('Cannot Delete Account', detail || 'Something went wrong. Please try again.')
    }
  }

  const confirmDelete = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account. You will not be able to log in again. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteAccount },
      ],
    )
  }

  return (
    <View className="gap-4 rounded-2xl border border-border p-5">
      <Text className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Danger Zone</Text>
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">Delete Account</Text>
        <Text className="text-sm text-muted-foreground">
          Permanently delete your account. You will not be able to log in again. This action cannot be undone.
        </Text>
      </View>
      <Button variant="destructive" onPress={confirmDelete} disabled={isDeleting}>
        <Text>{isDeleting ? 'Deleting…' : 'Delete Account'}</Text>
      </Button>
    </View>
  )
}
