/**
 * Shared types used across all packages in the monorepo.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - "Find Implementations" of SharedEntity across packages
 * - Rename "SharedEntity" and see all packages update
 * - "Go to Definition" from backend/frontend navigates here
 */

/** Base entity interface used by all packages */
export interface SharedEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Result type for operations across packages */
export interface Result<T, E = string> {
  ok: boolean;
  value?: T;
  error?: E;
}

/** Event types shared across packages */
export type SharedEventType = 'created' | 'updated' | 'deleted';

/** Event payload structure */
export interface SharedEvent<T> {
  type: SharedEventType;
  payload: T;
  timestamp: Date;
  source: 'backend' | 'frontend';
}

/** Serializable configuration */
export interface Config {
  apiUrl: string;
  timeout: number;
  debug: boolean;
}

/** Pagination params */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** User DTO shared between frontend and backend */
export interface UserDto extends SharedEntity {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
}

/** Item DTO shared between frontend and backend */
export interface ItemDto extends SharedEntity {
  title: string;
  description: string;
  ownerId: string;
  status: 'draft' | 'published' | 'archived';
}
