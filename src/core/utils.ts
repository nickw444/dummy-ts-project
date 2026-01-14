/**
 * Core utility functions used across the application.
 * 
 * Test scenarios:
 * - Rename "generateId" function and watch call sites update
 * - "Find References" on formatDate
 * - Move functions between files
 */

import type { Entity, Timestamped, OperationResult } from './types.js';

/** Generates a unique identifier */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Formats a date for display */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/** Creates timestamp fields for new entities */
export function createTimestamps(): Timestamped {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
  };
}

/** Updates the updatedAt timestamp */
export function touchTimestamp<T extends Timestamped>(entity: T): T {
  return {
    ...entity,
    updatedAt: new Date(),
  };
}

/** Creates a successful operation result */
export function success<T>(data: T): OperationResult<T> {
  return {
    success: true,
    data,
  };
}

/** Creates a failed operation result */
export function failure<T>(error: string): OperationResult<T> {
  return {
    success: false,
    error,
  };
}

/** Validates an entity has required base fields */
export function validateEntity(entity: Partial<Entity>): entity is Entity {
  return (
    typeof entity.id === 'string' &&
    entity.createdAt instanceof Date &&
    entity.updatedAt instanceof Date &&
    typeof entity.isActive === 'boolean'
  );
}

/** Deep clones an entity (simple implementation) */
export function cloneEntity<T extends Entity>(entity: T): T {
  return JSON.parse(JSON.stringify(entity)) as T;
}
