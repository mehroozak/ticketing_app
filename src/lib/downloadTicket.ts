import ReactNativeBlobUtil from 'react-native-blob-util'
import Share from 'react-native-share'
import { secureApi } from '../services/api'
import { END_POINTS } from './endpoints'

export async function downloadOrderTicketPdf(orderId: number): Promise<void> {
  const store = await import('../store/index').then((m) => m.store)
  const token = store.getState().auth.access
  const url = `${secureApi.defaults.baseURL}${END_POINTS.ORDER_PDF(orderId)}`
  const filename = `tickets-order-${orderId}.pdf`
  const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`

  const res = await ReactNativeBlobUtil.config({ path, overwrite: true }).fetch('GET', url, {
    Authorization: `Bearer ${token}`,
  })

  if (res.info().status !== 200) {
    throw new Error('Failed to download ticket')
  }

  try {
    await Share.open({ url: `file://${res.path()}`, type: 'application/pdf', filename })
  } catch (err) {
    // The user dismissing the share sheet rejects this promise too — not a real failure
    if ((err as { message?: string })?.message !== 'User did not share') throw err
  }
}
