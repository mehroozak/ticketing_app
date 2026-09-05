import { useCallback, useState } from 'react'
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin'
import { AccessToken, LoginManager } from 'react-native-fbsdk-next'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import { useAppDispatch } from '../store/hooks'
import { setCredentials } from '../store/slices/authSlice'
import { publicApi, type ApiEnvelope } from '../services/api'
import { END_POINTS } from '../lib/endpoints'
import type { AuthResponse } from '../types/auth'

type SocialProvider = 'google' | 'facebook' | 'apple'

export function useSocialAuth() {
  const dispatch = useAppDispatch()
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null)

  const handleBackendAuth = useCallback(
    async (endpoint: string, payload: Record<string, unknown>) => {
      const { data } = await publicApi.post<ApiEnvelope<AuthResponse>>(endpoint, payload)
      dispatch(
        setCredentials({
          user: data.data.user,
          access: data.data.access,
          refresh: data.data.refresh,
          organizations: data.data.organizations,
        }),
      )
    },
    [dispatch],
  )

  const triggerGoogle = useCallback(async () => {
    setLoadingProvider('google')
    try {
      await GoogleSignin.hasPlayServices()

      // The SDK caches the last-signed-in Google account on-device and silently
      // reuses it on the next signIn() with no account picker shown — a real problem
      // on a shared device (a second user would be logged in as the first user's
      // Google account). Signing out first forces the picker to appear every time.
      await GoogleSignin.signOut()

      const result = await GoogleSignin.signIn()
      if (result.type !== 'success') return

      const { accessToken } = await GoogleSignin.getTokens()
      await handleBackendAuth(END_POINTS.GOOGLE_AUTH, { access_token: accessToken })
    } catch (err) {
      // SIGN_IN_CANCELLED isn't an error — user just backed out of the flow.
      // Any other failure is either an SDK error or already toasted by publicApi's interceptor.
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        return
      }
    } finally {
      setLoadingProvider(null)
    }
  }, [handleBackendAuth])

  const triggerFacebook = useCallback(async () => {
    setLoadingProvider('facebook')
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email'])
      if (result.isCancelled) return

      const tokenData = await AccessToken.getCurrentAccessToken()
      if (!tokenData) return

      await handleBackendAuth(END_POINTS.FACEBOOK_AUTH, { access_token: tokenData.accessToken })
    } catch {
      // publicApi's response interceptor already toasts backend errors;
      // SDK-level failures (rare) fail silently rather than a raw error dialog
    } finally {
      setLoadingProvider(null)
    }
  }, [handleBackendAuth])

  const triggerApple = useCallback(async () => {
    setLoadingProvider('apple')
    try {
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      })
      if (!response.identityToken) return

      await handleBackendAuth(END_POINTS.APPLE_AUTH, {
        identity_token: response.identityToken,
        first_name: response.fullName?.givenName ?? '',
        last_name: response.fullName?.familyName ?? '',
      })
    } catch (err) {
      // CANCELED isn't an error — user just backed out of the native sheet.
      // Any other failure is either an SDK error or already toasted by publicApi's interceptor.
      const code = (err as { code?: string } | null)?.code
      if (code === appleAuth.Error.CANCELED) {
        return
      }
    } finally {
      setLoadingProvider(null)
    }
  }, [handleBackendAuth])

  return {
    triggerGoogle,
    triggerFacebook,
    triggerApple,
    isGoogleLoading: loadingProvider === 'google',
    isFacebookLoading: loadingProvider === 'facebook',
    isAppleLoading: loadingProvider === 'apple',
  }
}
