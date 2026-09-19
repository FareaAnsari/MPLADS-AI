import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Config } from '../../config/environment';
import { normalizeHttpError } from './errors';
import { secureStorage } from '../local/interfaces/secureStorage';
import { logger } from '../../utils/logger';

const SECURE_TOKEN_KEY = 'pratyaksh_auth_token';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: Config.apiBaseUrl,
      timeout: Config.requestTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client-Platform': 'React-Native-Expo',
        'X-Client-Version': '1.0.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor: Attach Bearer token strictly to configured backend domain
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await secureStorage.getItem(SECURE_TOKEN_KEY);
          if (token && config.headers) {
            // Verify target domain matches configured base URL before attaching auth
            const requestUrl = config.url || '';
            const isTargetingBackend = !requestUrl.startsWith('http') || requestUrl.startsWith(Config.apiBaseUrl);

            if (isTargetingBackend) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (err) {
          logger.warn('ApiClient', 'Could not read secure token for request attachment', err);
        }

        logger.debug('ApiClient', `Outgoing: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(normalizeHttpError(error))
    );

    // Response Interceptor: Handle 401 Unauthorized
    this.instance.interceptors.response.use(
      (response) => {
        logger.debug('ApiClient', `Received Response: ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        const normalized = normalizeHttpError(error);
        if (normalized.statusCode === 401) {
          logger.warn('ApiClient', 'HTTP 401 Unauthorized encountered from backend.');
        }
        return Promise.reject(normalized);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.instance.get(url, config);
    return res.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.instance.post(url, data, config);
    return res.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.instance.put(url, data, config);
    return res.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.instance.delete(url, config);
    return res.data;
  }
}

export const apiClient = new ApiClient();

