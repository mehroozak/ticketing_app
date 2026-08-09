import type { Theme } from '@react-navigation/native'

// Tokens not covered by React Navigation's Theme shape (colors.primary/background/card/border/text/notification only)
// but needed for imperative color props (e.g. tabBarActiveTintColor) elsewhere. Kept in sync with global.css.
export const BRAND_COLOR = 'hsl(46, 100%, 50%)' // --brand — same value in both light and dark

export const MUTED_FOREGROUND = {
  light: 'hsl(0, 0%, 42%)', // --muted-foreground (:root)
  dark: 'hsl(0, 0%, 65%)', // --muted-foreground (.dark)
}

export const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    dark: false,
    colors: {
      background: '#FAFAF8',
      border: '#E3E1D9',
      card: '#FFFFFF',
      notification: '#dc2626',
      primary: '#0C0C0C',
      text: '#0C0C0C',
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  },
  dark: {
    dark: true,
    colors: {
      background: '#050505',
      border: '#242424',
      card: '#101010',
      notification: '#f87171',
      primary: '#F5F5F5',
      text: '#F5F5F5',
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  },
}
