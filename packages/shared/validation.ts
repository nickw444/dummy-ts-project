/**
 * Shared validation utilities.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - Rename ValidationError and see updates in backend/frontend
 * - "Find References" on validateEmail shows cross-package usage
 */

import type { UserDto, ItemDto } from './types.js';

/** Validation error with field information */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/** Validation result type */
export interface ValidationResult {
  ok: boolean;
  errors?: ValidationError[];
}

/** Creates a successful validation result */
function validationSuccess(): ValidationResult {
  return { ok: true };
}

/** Creates a failed validation result */
function validationError(errors: ValidationError[]): ValidationResult {
  return { ok: false, errors };
}

/** Email validation regex */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates an email address */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return validationError([{
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED',
    }]);
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return validationError([{
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
    }]);
  }
  
  return validationSuccess();
}

/** Validates a name field */
export function validateName(name: string, fieldName: string = 'name'): ValidationResult {
  if (!name || name.trim().length === 0) {
    return validationError([{
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED',
    }]);
  }
  
  if (name.length < 2) {
    return validationError([{
      field: fieldName,
      message: `${fieldName} must be at least 2 characters`,
      code: 'MIN_LENGTH',
    }]);
  }
  
  if (name.length > 100) {
    return validationError([{
      field: fieldName,
      message: `${fieldName} must not exceed 100 characters`,
      code: 'MAX_LENGTH',
    }]);
  }
  
  return validationSuccess();
}

/** Validates a UserDto */
export function validateUserDto(user: Partial<UserDto>): ValidationResult {
  const errors: ValidationError[] = [];
  
  const emailResult = validateEmail(user.email ?? '');
  if (!emailResult.ok && emailResult.errors) {
    errors.push(...emailResult.errors);
  }
  
  const nameResult = validateName(user.name ?? '', 'name');
  if (!nameResult.ok && nameResult.errors) {
    errors.push(...nameResult.errors);
  }
  
  if (!user.role) {
    errors.push({
      field: 'role',
      message: 'Role is required',
      code: 'REQUIRED',
    });
  }
  
  return errors.length > 0 ? validationError(errors) : validationSuccess();
}

/** Validates an ItemDto */
export function validateItemDto(item: Partial<ItemDto>): ValidationResult {
  const errors: ValidationError[] = [];
  
  const titleResult = validateName(item.title ?? '', 'title');
  if (!titleResult.ok && titleResult.errors) {
    errors.push(...titleResult.errors);
  }
  
  if (!item.description) {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: 'REQUIRED',
    });
  }
  
  if (!item.ownerId) {
    errors.push({
      field: 'ownerId',
      message: 'Owner ID is required',
      code: 'REQUIRED',
    });
  }
  
  if (!item.status) {
    errors.push({
      field: 'status',
      message: 'Status is required',
      code: 'REQUIRED',
    });
  }
  
  return errors.length > 0 ? validationError(errors) : validationSuccess();
}

/** Combines multiple validation results */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  
  for (const result of results) {
    if (!result.ok && result.errors) {
      allErrors.push(...result.errors);
    }
  }
  
  return allErrors.length > 0 ? validationError(allErrors) : validationSuccess();
}
