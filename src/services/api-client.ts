/**
 * API Client Layer for CourseCompass
 * Ready for FastAPI backend integration with session context.
 * In development or when VITE_DEMO_MODE is true, falls back to mock services.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || true;

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseData?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
      throw new ApiError(
        errorData?.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network or server connection failed', 500, error);
  }
}
