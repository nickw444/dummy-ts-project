/**
 * User service - business logic layer for user operations.
 * 
 * Test scenarios:
 * - "Find References" on UserService class
 * - Rename "authenticateUser" and see all call sites update
 * - "Go to Definition" on Repository navigates to core/types.ts
 */

import type { Repository, OperationResult, EventHandler, EntityEvent } from '../core/types.js';
import { failure, touchTimestamp } from '../core/utils.js';
import type { User } from '../models/user.js';
import { createUser, UserRole, isAdmin, canEdit } from '../models/user.js';

/** User service for managing users */
export class UserService {
  private eventHandlers: EventHandler<User>[] = [];

  constructor(private readonly repository: Repository<User>) {}

  /** Registers a new user */
  async registerUser(
    email: string,
    username: string,
    displayName: string
  ): Promise<OperationResult<User>> {
    const user = createUser(email, username, displayName, UserRole.Viewer);
    const result = await this.repository.save(user);
    
    if (result.success && result.data) {
      this.emitEvent('create', result.data);
    }
    
    return result;
  }

  /** Gets a user by ID */
  async getUserById(id: string): Promise<User | null> {
    const user = await this.repository.findById(id);
    if (user) {
      this.emitEvent('read', user);
    }
    return user;
  }

  /** Gets all users */
  async getAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }

  /** Updates a user's profile */
  async updateUserProfile(
    id: string,
    updates: Partial<Pick<User, 'displayName' | 'email'>>
  ): Promise<OperationResult<User>> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return failure(`User with id ${id} not found`);
    }

    const updated = touchTimestamp({
      ...existing,
      ...updates,
    });

    const result = await this.repository.save(updated);
    
    if (result.success && result.data) {
      this.emitEvent('update', result.data);
    }
    
    return result;
  }

  /** Changes a user's role (admin only operation) */
  async changeUserRole(
    actorId: string,
    targetUserId: string,
    newRole: UserRole
  ): Promise<OperationResult<User>> {
    const actor = await this.repository.findById(actorId);
    if (!actor || !isAdmin(actor)) {
      return failure('Only admins can change user roles');
    }

    const target = await this.repository.findById(targetUserId);
    if (!target) {
      return failure(`User with id ${targetUserId} not found`);
    }

    const updated = touchTimestamp({
      ...target,
      role: newRole,
    });

    return this.repository.save(updated);
  }

  /** Deactivates a user account */
  async deactivateUser(id: string): Promise<OperationResult<User>> {
    const user = await this.repository.findById(id);
    if (!user) {
      return failure(`User with id ${id} not found`);
    }

    const deactivated = touchTimestamp({
      ...user,
      isActive: false,
    });

    const result = await this.repository.save(deactivated);
    
    if (result.success && result.data) {
      this.emitEvent('update', result.data);
    }
    
    return result;
  }

  /** Deletes a user */
  async deleteUser(id: string): Promise<OperationResult<void>> {
    const user = await this.repository.findById(id);
    if (user) {
      const result = await this.repository.delete(id);
      if (result.success) {
        this.emitEvent('delete', user);
      }
      return result;
    }
    return failure(`User with id ${id} not found`);
  }

  /** Checks if user can perform edit operations */
  checkEditPermission(user: User): boolean {
    return canEdit(user);
  }

  /** Subscribe to user events */
  onEvent(handler: EventHandler<User>): void {
    this.eventHandlers.push(handler);
  }

  /** Emit an event to all handlers */
  private emitEvent(type: EntityEvent<User>['type'], entity: User): void {
    const event: EntityEvent<User> = {
      type,
      entity,
      timestamp: new Date(),
    };
    this.eventHandlers.forEach(handler => handler(event));
  }
}

/** Simulates user authentication */
export function authenticateUser(user: User, password: string): boolean {
  // Simplified auth - in real app would check hashed password
  return user.isActive && password.length >= 8;
}

/** Gets user display info */
export function getUserDisplayInfo(user: User): string {
  return `${user.displayName} (${user.email}) - ${user.role}`;
}
