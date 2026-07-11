/**
 * @format
 */
import 'react-native-gesture-handler';
import './global.css';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

if (__DEV__) {
  // Suppress the native "Fast Refresh disconnected" banner (DevLoadingView) —
  // this device is routinely off the same network as the Metro server, so the
  // banner fires constantly and is not actionable; live reload still fails
  // silently as normal, this only hides the popup.
  require('react-native/Libraries/Utilities/DevLoadingView').default.showMessage = () => {};
}

AppRegistry.registerComponent(appName, () => App);
