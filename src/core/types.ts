/**
 * Core type definitions used throughout the application.
 * These interfaces are implemented by models and used by services.
 * 
 * Test scenarios:
 * - "Find Implementations" on Entity interface
 * - "Find References" on Identifiable
 * - Rename "Entity" and see all implementations update
 */

/** Base interface for all identifiable entities */
export interface Identifiable {
  id: string;
}

/** Mixin interface for entities with timestamps */
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

/** Combined base entity interface */
export interface Entity extends Identifiable, Timestamped {
  /** Indicates if this entity is active/enabled */
  isActive: boolean;
}

/** Generic result wrapper for operations */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Repository interface - for testing "Find Implementations" */
export interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<OperationResult<T>>;
  delete(id: string): Promise<OperationResult<void>>;
}

/** Event types for the event system */
export type EventType = 'create' | 'update' | 'delete' | 'read';

/** Event handler signature */
export type EventHandler<T> = (event: EntityEvent<T>) => void;

/** Event payload structure */
export interface EntityEvent<T> {
  type: EventType;
  entity: T;
  timestamp: Date;
}
