export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code: 'NETWORK_ERROR' | 'TIMEOUT' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN' = 'UNKNOWN',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const normalizeHttpError = (error: any): ApiError => {
  if (error instanceof ApiError) return error;

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new ApiError('Request timed out. Please check your connection.', 408, 'TIMEOUT');
  }

  if (!error.response) {
    return new ApiError(
      'Unable to connect to government server. Please check your network.',
      0,
      'NETWORK_ERROR',
      error.message
    );
  }

  const status = error.response.status;
  const data = error.response.data;
  const message = data?.detail || data?.message || error.message || 'An unexpected API error occurred.';

  switch (status) {
    case 401:
      return new ApiError('Session expired or unauthorized. Please re-authenticate.', 401, 'UNAUTHORIZED', data);
    case 403:
      return new ApiError('You do not have administrative permission for this resource.', 403, 'FORBIDDEN', data);
    case 404:
      return new ApiError('The requested statutory record was not found.', 404, 'NOT_FOUND', data);
    case 422:
      return new ApiError('Data validation error in request payload.', 422, 'VALIDATION_ERROR', data);
    case 500:
    case 502:
    case 503:
      return new ApiError('Official server is currently under maintenance. Please retry shortly.', status, 'SERVER_ERROR', data);
    default:
      return new ApiError(message, status, 'UNKNOWN', data);
  }
};
