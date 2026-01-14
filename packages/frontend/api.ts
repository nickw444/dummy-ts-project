/**
 * Frontend API client.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - "Find References" on shared types shows frontend usage
 * - Rename API methods and see component updates
 * - "Go to Definition" on Result navigates to shared
 */

import type { 
  Result, 
  UserDto, 
  ItemDto, 
  PaginatedResponse, 
  PaginationParams 
} from 'shared/types';
import { createSuccess, createError, formatApiDate } from 'shared/utils';
import type { ApiClientConfig } from './types.js';

/** API client for communicating with backend */
export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /** Sets authentication token */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /** Clears authentication token */
  clearAuthToken(): void {
    delete this.headers['Authorization'];
  }

  /** Makes a fetch request with configuration */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<Result<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        return createError(errorData.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json() as T;
      return createSuccess(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return createError('Request timeout');
        }
        return createError(error.message);
      }
      return createError('Unknown error');
    }
  }

  // User API methods

  /** Registers a new user */
  async registerUser(
    email: string,
    name: string,
    password: string
  ): Promise<Result<UserDto>> {
    return this.request<UserDto>('POST', '/users/register', {
      email,
      name,
      password,
    });
  }

  /** Logs in a user */
  async loginUser(email: string, password: string): Promise<Result<{ user: UserDto; token: string }>> {
    return this.request<{ user: UserDto; token: string }>('POST', '/users/login', {
      email,
      password,
    });
  }

  /** Gets current user */
  async getCurrentUser(): Promise<Result<UserDto>> {
    return this.request<UserDto>('GET', '/users/me');
  }

  /** Updates user profile */
  async updateUser(id: string, updates: Partial<Pick<UserDto, 'name'>>): Promise<Result<UserDto>> {
    return this.request<UserDto>('PATCH', `/users/${id}`, updates);
  }

  /** Lists users */
  async listUsers(params: PaginationParams): Promise<Result<PaginatedResponse<UserDto>>> {
    const query = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });
    return this.request<PaginatedResponse<UserDto>>('GET', `/users?${query}`);
  }

  // Item API methods

  /** Creates a new item */
  async createItem(
    title: string,
    description: string,
    status: ItemDto['status'] = 'draft'
  ): Promise<Result<ItemDto>> {
    return this.request<ItemDto>('POST', '/items', {
      title,
      description,
      status,
    });
  }

  /** Gets an item by ID */
  async getItem(id: string): Promise<Result<ItemDto>> {
    return this.request<ItemDto>('GET', `/items/${id}`);
  }

  /** Lists items */
  async listItems(params: PaginationParams): Promise<Result<PaginatedResponse<ItemDto>>> {
    const query = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    });
    return this.request<PaginatedResponse<ItemDto>>('GET', `/items?${query}`);
  }

  /** Updates item status */
  async updateItemStatus(id: string, status: ItemDto['status']): Promise<Result<ItemDto>> {
    return this.request<ItemDto>('PATCH', `/items/${id}/status`, { status });
  }

  /** Deletes an item */
  async deleteItem(id: string): Promise<Result<void>> {
    return this.request<void>('DELETE', `/items/${id}`);
  }
}

/** Creates a default API client */
export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient({
    baseUrl,
    timeout: 30000,
  });
}

/** Formats a date for display in the UI */
export function formatDisplayDate(date: Date): string {
  return formatApiDate(date).split('T')[0] ?? '';
}
