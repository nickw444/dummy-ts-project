/**
 * Frontend package entry point.
 */

export * from './types.js';
export * from './api.js';
export * from './state.js';

// Re-export commonly used shared types for convenience
export type { 
  UserDto, 
  ItemDto, 
  Result, 
  PaginationParams, 
  PaginatedResponse,
  SharedEvent 
} from 'shared/types';
export type { ValidationError } from 'shared/validation';
