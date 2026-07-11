import { useCallback, useState } from 'react'
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin'
import { AccessToken, LoginManager } from 'react-native-fbsdk-next'
import { useAppDispatch } from '../store/hooks'
import { setCredentials } from '../store/slices/authSlice'
import { publicApi, type ApiEnvelope } from '../services/api'
import { END_POINTS } from '../lib/endpoints'
import type { AuthResponse } from '../types/auth'

type SocialProvider = 'google' | 'facebook'

export function useSocialAuth() {
  const dispatch = useAppDispatch()
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null)

  const handleBackendAuth = useCallback(
    async (endpoint: string, accessToken: string) => {
      const { data } = await publicApi.post<ApiEnvelope<AuthResponse>>(endpoint, { access_token: accessToken })
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
      const result = await GoogleSignin.signIn()
      if (result.type !== 'success') return

      const { accessToken } = await GoogleSignin.getTokens()
      await handleBackendAuth(END_POINTS.GOOGLE_AUTH, accessToken)
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

      await handleBackendAuth(END_POINTS.FACEBOOK_AUTH, tokenData.accessToken)
    } catch {
      // publicApi's response interceptor already toasts backend errors;
      // SDK-level failures (rare) fail silently rather than a raw error dialog
    } finally {
      setLoadingProvider(null)
    }
  }, [handleBackendAuth])

  return {
    triggerGoogle,
    triggerFacebook,
    isGoogleLoading: loadingProvider === 'google',
    isFacebookLoading: loadingProvider === 'facebook',
  }
}
