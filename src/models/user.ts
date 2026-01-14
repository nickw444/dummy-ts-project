/**
 * User model - implements Entity interface from core.
 * 
 * Test scenarios:
 * - "Find Implementations" of Entity shows this class
 * - "Go to Definition" on Entity navigates to core/types.ts
 * - Rename UserRole enum and see all usages update
 */

import type { Entity, Repository, OperationResult } from '../core/types.js';
import { generateId, createTimestamps, success, failure } from '../core/utils.js';

/** User roles for authorization */
export enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
  Guest = 'guest',
}

/** User entity - implements the Entity interface */
export interface User extends Entity {
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  lastLoginAt?: Date;
}

/** Creates a new user with default values */
export function createUser(
  email: string,
  username: string,
  displayName: string,
  role: UserRole = UserRole.Viewer
): User {
  return {
    id: generateId(),
    ...createTimestamps(),
    isActive: true,
    email,
    username,
    displayName,
    role,
  };
}

/** In-memory user repository implementation */
export class InMemoryUserRepository implements Repository<User> {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<OperationResult<User>> {
    this.users.set(user.id, user);
    return success(user);
  }

  async delete(id: string): Promise<OperationResult<void>> {
    if (this.users.has(id)) {
      this.users.delete(id);
      return success(undefined);
    }
    return failure(`User with id ${id} not found`);
  }

  /** Find user by email - domain-specific method */
  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  /** Find users by role */
  async findByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === role);
  }
}

/** Checks if a user has admin privileges */
export function isAdmin(user: User): boolean {
  return user.role === UserRole.Admin;
}

/** Checks if user can edit content */
export function canEdit(user: User): boolean {
  return user.role === UserRole.Admin || user.role === UserRole.Editor;
}
