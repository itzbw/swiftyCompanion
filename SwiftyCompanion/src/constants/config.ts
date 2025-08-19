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
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  error: '#FF3333',
  success: '#4CAF50',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
} as const;
