export const API_CONFIG = {
  BASE_URL: 'https://api.intra.42.fr',
  CLIENT_ID: process.env.EXPO_PUBLIC_CLIENT_ID || '',
  CLIENT_SECRET: process.env.EXPO_PUBLIC_CLIENT_SECRET || '',
  REDIRECT_URI: process.env.EXPO_PUBLIC_REDIRECT_URI || '',
} as const;

console.log('API_CONFIG:', {
  CLIENT_ID: API_CONFIG.CLIENT_ID ? 'Set' : 'Not set',
  CLIENT_SECRET: API_CONFIG.CLIENT_SECRET ? 'Set' : 'Not set',
  BASE_URL: API_CONFIG.BASE_URL,
});

export const ENDPOINTS = {
  OAUTH_TOKEN: '/oauth/token',
  OAUTH_AUTHORIZE: '/oauth/authorize',
  USERS: '/v2/users',
} as const;

export const COLORS = {
  // Primary neon colors
  primary: '#FF00FF',
  secondary: '#8A2BE2',
  accent: '#FF1493',

  // Background colors (dark base)
  background: '#0A0A0F',
  surface: '#1A1A2E',
  surfaceSecondary: '#16213E',
  surfaceAccent: '#2D1B69',

  // Text colors
  text: '#F8F8FF',
  textSecondary: '#C8B2DB',
  textMuted: '#9370DB',

  // Accent colors
  neonPink: '#FF10F0',
  neonViolet: '#8B00FF',
  neonBlue: '#00FFFF',

  // Utility colors
  border: '#4B0082',
  borderAccent: '#DA70D6',

  // Status colors (with neon twist)
  success: '#00FF7F',
  error: '#FF1493',
  warning: '#FFD700',
  info: '#00BFFF',

  // Glow effects (for shadows/glows)
  glowPink: '#FF10F0',
  glowViolet: '#8B00FF',
  glowCyan: '#00FFFF',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
} as const;

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const GLOW_STYLES = {
  neonGlow: {
    shadowColor: COLORS.glowPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 20,
  },
  violetGlow: {
    shadowColor: COLORS.glowViolet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 15,
  },
  cyanGlow: {
    shadowColor: COLORS.glowCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 10,
  },
} as const;
