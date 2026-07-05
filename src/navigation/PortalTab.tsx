import React from 'react'
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import AuthStackNavigator from './AuthStackNavigator'
import PortalDrawerNavigator from './PortalDrawerNavigator'

export default function PortalTab() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return isAuthenticated ? <PortalDrawerNavigator /> : <AuthStackNavigator />
}
