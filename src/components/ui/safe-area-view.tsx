import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { cssInterop } from 'nativewind'

// Third-party component — NativeWind only auto-styles core react-native components,
// so `className` is a no-op here without this registration.
cssInterop(RNSafeAreaView, { className: 'style' })

export { RNSafeAreaView as SafeAreaView }
