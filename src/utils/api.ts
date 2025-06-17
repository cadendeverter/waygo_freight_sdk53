import { Platform } from 'react-native';
import { auth, functions } from '../../firebase/config';

import { httpsCallable } from 'firebase/functions';
import { API_BASE_URL, IS_DEV } from '@env';





// TODO: connectFunctionsEmulator(functions, 'localhost', 5001) if needed

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  code: string;
  details?: any;
  status: number;

  constructor(code: string, message: string, status: number = 400, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const apiRequest = async <T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await auth.currentUser?.getIdToken();

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Platform': Platform.OS,
    'X-App-Version': '1.0.0', // TODO: Get from app config
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const responseData: ApiResponse<T> = await response.json();

    if (!response.ok) {
      const error = responseData.error || {
        code: 'unknown_error',
        message: 'An unknown error occurred',
      };
      throw new ApiError(
        error.code,
        error.message,
        response.status,
        error.details
      );
    }

    return responseData.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'network_error',
      'Network request failed. Please check your connection.',
      0
    );
  }
};

export const callFunction = async <T = any, R = any>(
  functionName: string,
  data?: T
): Promise<R> => {
  try {
    const functionRef = httpsCallable<T, R>(functions, functionName);
    const result = await functionRef(data || ({} as T));
    return result.data;
  } catch (error: any) {
    console.error(`Firebase function ${functionName} error:`, error);
    throw new ApiError(
      error.code || 'function_error',
      error.message || 'Function execution failed',
      error.status || 500,
      error.details
    );
  }
};

export const createApiService = <T extends Record<string, any>>(basePath: string) => {
  const service: Record<string, any> = {};

  // CRUD operations
  service.getAll = (query?: Record<string, any>) =>
    apiRequest<T[]>(`${basePath}${query ? `?${new URLSearchParams(query)}` : ''}`);

  service.getById = (id: string) => apiRequest<T>(`${basePath}/${id}`);

  service.create = (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<T>(basePath, 'POST', data);

  service.update = (id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>) =>
    apiRequest<T>(`${basePath}/${id}`, 'PATCH', data);

  service.delete = (id: string) => apiRequest<void>(`${basePath}/${id}`, 'DELETE');

  // Add custom methods
  service.withCustomMethod = <U>(
    methodName: string,
    method: (id: string, data: any) => Promise<U>
  ) => {
    service[methodName] = method;
    return service as typeof service & { [key: string]: (id: string, data: any) => Promise<U> };
  };

  return service as {
    getAll: (query?: Record<string, any>) => Promise<T[]>;
    getById: (id: string) => Promise<T>;
    create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
    update: (id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<T>;
    delete: (id: string) => Promise<void>;
    withCustomMethod: <U>(
      methodName: string,
      method: (id: string, data: any) => Promise<U>
    ) => any;
  };
};

// Example usage:
// const userService = createApiService<User>('/users');
// const users = await userService.getAll();
// const user = await userService.getById('123');
// const newUser = await userService.create({ name: 'John' });
// const updatedUser = await userService.update('123', { name: 'John Doe' });
// await userService.delete('123');
