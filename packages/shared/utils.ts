/**
 * Shared utility functions used across all packages.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - Rename "createResult" and see all usages in backend/frontend update
 * - "Find References" shows usages across project boundaries
 */

import type { Result, PaginatedResponse, PaginationParams, SharedEntity } from './types.js';

/** Creates a success result */
export function createSuccess<T>(value: T): Result<T> {
  return { ok: true, value };
}

/** Creates an error result */
export function createError<T, E = string>(error: E): Result<T, E> {
  return { ok: false, error };
}

/** Helper to unwrap a result or throw */
export function unwrapResult<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(result.error ?? 'Unknown error');
  }
  if (result.value === undefined) {
    throw new Error('Result value is undefined');
  }
  return result.value;
}

/** Generates a unique ID */
export function generateUniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
}

/** Creates base entity fields */
export function createEntityFields(): Omit<SharedEntity, never> {
  const now = new Date();
  return {
    id: generateUniqueId(),
    createdAt: now,
    updatedAt: now,
  };
}

/** Updates the updatedAt field */
export function touchEntity<T extends SharedEntity>(entity: T): T {
  return {
    ...entity,
    updatedAt: new Date(),
  };
}

/** Creates a paginated response */
export function paginate<T>(
  items: T[],
  params: PaginationParams
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / params.pageSize);
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  
  return {
    items: items.slice(start, end),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
  };
}

/** Formats a date for API responses */
export function formatApiDate(date: Date): string {
  return date.toISOString();
}

/** Parses a date from API requests */
export function parseApiDate(dateString: string): Date {
  return new Date(dateString);
}

/** Validates an entity has required fields */
export function isValidEntity(obj: unknown): obj is SharedEntity {
  if (typeof obj !== 'object' || obj === null) return false;
  const entity = obj as Record<string, unknown>;
  return (
    typeof entity['id'] === 'string' &&
    entity['createdAt'] instanceof Date &&
    entity['updatedAt'] instanceof Date
  );
}

/** Deep equality check for entities */
export function entitiesEqual(a: SharedEntity, b: SharedEntity): boolean {
  return a.id === b.id;
}
