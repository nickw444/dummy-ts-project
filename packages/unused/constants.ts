/**
 * Unused constants for auto-import testing.
 * 
 * TEST SCENARIOS:
 * - Type "MAX_RETRIES" and test auto-import of constants
 * - Type "HttpStatus" and verify IDE suggests the enum
 * - Type "DEFAULT_CONFIG" to test auto-import of objects
 */

/** Maximum number of retry attempts */
export const MAX_RETRIES = 3;

/** Default timeout in milliseconds */
export const DEFAULT_TIMEOUT = 5000;

/** API version string */
export const API_VERSION = 'v1';

/** HTTP status codes */
export enum HttpStatus {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

/** Default configuration object */
export const DEFAULT_CONFIG = {
  retries: MAX_RETRIES,
  timeout: DEFAULT_TIMEOUT,
  apiVersion: API_VERSION,
  debug: false,
} as const;

/** Supported locales */
export const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'] as const;

/** Type for supported locales */
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Using nested module symbols
import { MathUtils2, calculatePercentage } from 'unused/nested/math';

/** Default retry delay calculated using MathUtils */
export const DEFAULT_RETRY_DELAY = MathUtils2.multiply(DEFAULT_TIMEOUT, 0.1);

/** Calculate success rate */
export function calculateSuccessRate(successes: number, total: number): number {
  return calculatePercentage(successes, total);
}
