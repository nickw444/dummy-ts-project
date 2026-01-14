/**
 * Nested math utilities - for testing refactoring across subdirectories.
 * 
 * TEST SCENARIOS:
 * - Rename "MathUtils" class and see updates in unused/ and backend/
 * - "Find References" on "add" method shows usages across packages
 * - Move this file and test import path updates
 */

/** Math utility class */
export class MathUtils2 {
  /** Adds two numbers */
  static add(a: number, b: number): number {
    return a + b;
  }

  /** Subtracts two numbers */
  static subtract(a: number, b: number): number {
    return a - b;
  }

  /** Multiplies two numbers */
  static multiply(a: number, b: number): number {
    return a * b;
  }

  /** Divides two numbers */
  static divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
}

/** Calculates percentage */
export function calculatePercentage(value: number, total: number): number {
  return MathUtils2.divide(MathUtils2.multiply(value, 100), total);
}
