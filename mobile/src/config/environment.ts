export type EnvironmentType = 'development' | 'staging' | 'production';

export interface AppEnvironmentConfig {
  environment: EnvironmentType;
  apiBaseUrl: string;
  apiVersion: string;
  enableDebugLogs: boolean;
  requestTimeoutMs: number;
}

const getEnvType = (): EnvironmentType => {
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT;
  if (env === 'production' || env === 'staging') return env;
  return 'development';
};

const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  try {
    // Dynamic require so Jest CommonJS runtime doesn't fail on ESM Constants
    const Constants = require('expo-constants')?.default;
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest?.debuggerHost ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip) {
        return `http://${ip}:8000`;
      }
    }
  } catch {
    // Standalone fallback
  }
  return 'http://192.168.0.103:8000';
};

export const Config: AppEnvironmentConfig = {
  environment: getEnvType(),
  apiBaseUrl: getApiBaseUrl(),
  apiVersion: 'v1',
  enableDebugLogs: getEnvType() !== 'production',
  requestTimeoutMs: 15000,
};
