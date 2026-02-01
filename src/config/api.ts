// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // Resources
  USERS: `${API_BASE_URL}/users`,
  CLIENTS: `${API_BASE_URL}/clients`,
  TRUCKS: `${API_BASE_URL}/trucks`,
  STOCKS: `${API_BASE_URL}/stocks`,
} as const;
