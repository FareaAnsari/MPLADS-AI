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
  // Configured public URL or local default
  return process.env.EXPO_PUBLIC_API_BASE_URL || 'https://pratyaksh-mplads.vercel.app';
};

export const Config: AppEnvironmentConfig = {
  environment: getEnvType(),
  apiBaseUrl: getApiBaseUrl(),
  apiVersion: 'v1',
  enableDebugLogs: getEnvType() !== 'production',
  requestTimeoutMs: 15000,
};
