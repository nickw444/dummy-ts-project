/**
 * Backend package entry point.
 */

export * from './models.js';
export * from './repository.js';
export * from './services.js';

// Re-export commonly used shared types for convenience
export type { 
  UserDto, 
  ItemDto, 
  Result, 
  PaginationParams, 
  PaginatedResponse,
  SharedEvent 
} from 'shared/types';
