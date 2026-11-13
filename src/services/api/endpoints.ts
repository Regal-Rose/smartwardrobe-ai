/**
 * Planned API endpoint constants for future FastAPI backend integration.
 *
 * These map to the backend's REST API contracts.
 * Used by HTTP repository implementations.
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  AUTH_ME: '/api/v1/auth/me',
  AUTH_FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/api/v1/auth/reset-password',

  // Garments
  GARMENTS: '/api/v1/garments',
  GARMENT: (id: string) => `/api/v1/garments/${id}`,

  // Outfits
  OUTFITS: '/api/v1/outfits',
  OUTFIT: (id: string) => `/api/v1/outfits/${id}`,
  OUTFITS_GENERATE: '/api/v1/recommendations',
  RECOMMENDATIONS: '/api/v1/recommendations',
  FAVORITES: '/api/v1/favorites',
  FAVORITE: (id: string) => `/api/v1/favorites/${id}`,
  WEAR_HISTORY: '/api/v1/wear-history',
  RECORD_WEAR: (id: string) => `/api/v1/outfits/${id}/wear`,
  OUTFIT_FEEDBACK: (id: string) => `/api/v1/outfits/${id}/feedback`,

  // Preferences
  PREFERENCES: '/api/v1/preferences',

  // Analytics
  WARDROBE_ANALYTICS: '/api/v1/analytics/wardrobe',
  ACTIVITY_ANALYTICS: '/api/v1/analytics/activity',

  // Health
  HEALTH: '/api/health',

  // AI Lookbook & Virtual Try-On
  LOOKBOOK_GENERATE: '/api/v1/lookbook',
  TRY_ON: '/api/try-on',
  UPLOAD_CLOTHING: '/api/upload-clothing',

  // Weather Suggestions
  WEATHER: '/api/v1/weather',
  WEATHER_SUGGESTIONS: '/api/v1/weather',

  // Planner
  PLANNER: '/api/planner',
  PLANNER_MONTH: (month: string) => `/api/planner/${month}`,
  PLANNER_DELETE: (id: number | string) => `/api/planner/${id}`,
} as const;