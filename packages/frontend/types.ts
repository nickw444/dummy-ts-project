/**
 * Frontend-specific types extending shared types.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - "Go to Definition" on UserDto navigates to shared package
 * - "Find Implementations" of SharedEntity includes frontend types
 * - Rename frontend types and see component updates
 */

import type { 
  UserDto, 
  ItemDto, 
  SharedEvent, 
  PaginationParams 
} from 'shared/types';

/** UI state for a user */
export interface UserState {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
}

/** UI state for items */
export interface ItemsState {
  items: ItemDto[];
  selectedItem: ItemDto | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationParams;
}

/** Form state for user registration */
export interface UserFormState {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

/** Form state for item creation */
export interface ItemFormState {
  title: string;
  description: string;
  status: ItemDto['status'];
  errors: Record<string, string>;
  isSubmitting: boolean;
}

/** UI notification */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/** Event handler for shared events */
export type SharedEventHandler<T> = (event: SharedEvent<T>) => void;

/** Action types for state management */
export type UserAction =
  | { type: 'SET_USER'; payload: UserDto }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

export type ItemAction =
  | { type: 'SET_ITEMS'; payload: ItemDto[] }
  | { type: 'ADD_ITEM'; payload: ItemDto }
  | { type: 'UPDATE_ITEM'; payload: ItemDto }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SELECT_ITEM'; payload: ItemDto | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_PAGINATION'; payload: PaginationParams };

/** API client configuration */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
}
