/**
 * Unused interfaces for auto-import testing.
 * 
 * TEST SCENARIOS:
 * - Type "Serializable" and test auto-import of interfaces
 * - Type "LogLevel" and verify IDE suggests the type
 * - Type "EventBus" to test auto-import of generic interfaces
 */

/** Interface for objects that can be serialized */
export interface Serializable {
  toJSON(): string;
  fromJSON(json: string): void;
}

/** Interface for disposable resources */
export interface Disposable {
  dispose(): void;
  isDisposed: boolean;
}

/** Log levels */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Logger interface */
export interface Logger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/** Event bus for pub/sub pattern */
export interface EventBus<TEvents extends Record<string, unknown>> {
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
  on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): () => void;
  off<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): void;
}

/** Cache interface */
export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
}

/** Comparable interface for sorting */
export interface Comparable<T> {
  compareTo(other: T): number;
}
