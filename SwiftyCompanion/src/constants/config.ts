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
  primary: '#00BABC',
  secondary: '#FF6B35',
  background: '#0D1117', // Dark background
  surface: '#161B22', // Card backgrounds
  surfaceSecondary: '#21262D', // Secondary surfaces
  text: '#F0F6FC', // Primary text (light)
  textSecondary: '#8B949E', // Secondary text (gray)
  border: '#30363D', // Border color
  error: '#F85149', // Error red
  success: '#56D364', // Success green
  warning: '#E3B341', // Warning yellow
  accent: '#A5A5F5', // Accent color
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
