/**
 * Backend repository implementations.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - "Find References" on SharedEntity shows implementations here
 * - Rename repository methods and see service updates
 */

import type { 
  SharedEntity, 
  Result, 
  PaginationParams, 
  PaginatedResponse 
} from 'shared/types';
import { 
  createSuccess, 
  createError, 
  paginate, 
  touchEntity 
} from 'shared/utils';
import type { BackendUser, BackendItem } from './models.js';

/** Generic repository interface */
export interface Repository<T extends SharedEntity> {
  findById(id: string): Promise<Result<T>>;
  findAll(): Promise<Result<T[]>>;
  findPaginated(params: PaginationParams): Promise<Result<PaginatedResponse<T>>>;
  save(entity: T): Promise<Result<T>>;
  delete(id: string): Promise<Result<void>>;
}

/** In-memory repository implementation */
export class InMemoryRepository<T extends SharedEntity> implements Repository<T> {
  protected store: Map<string, T> = new Map();

  async findById(id: string): Promise<Result<T>> {
    const entity = this.store.get(id);
    if (!entity) {
      return createError(`Entity with id ${id} not found`);
    }
    return createSuccess(entity);
  }

  async findAll(): Promise<Result<T[]>> {
    return createSuccess(Array.from(this.store.values()));
  }

  async findPaginated(params: PaginationParams): Promise<Result<PaginatedResponse<T>>> {
    const items = Array.from(this.store.values());
    return createSuccess(paginate(items, params));
  }

  async save(entity: T): Promise<Result<T>> {
    const updated = touchEntity(entity);
    this.store.set(updated.id, updated);
    return createSuccess(updated);
  }

  async delete(id: string): Promise<Result<void>> {
    if (!this.store.has(id)) {
      return createError(`Entity with id ${id} not found`);
    }
    this.store.delete(id);
    return createSuccess(undefined);
  }
}

/** User repository with additional queries */
export class UserRepository extends InMemoryRepository<BackendUser> {
  async findByEmail(email: string): Promise<Result<BackendUser>> {
    for (const user of this.store.values()) {
      if (user.email === email) {
        return createSuccess(user);
      }
    }
    return createError(`User with email ${email} not found`);
  }

  async findByRole(role: BackendUser['role']): Promise<Result<BackendUser[]>> {
    const users = Array.from(this.store.values()).filter(u => u.role === role);
    return createSuccess(users);
  }

  async findVerified(): Promise<Result<BackendUser[]>> {
    const users = Array.from(this.store.values()).filter(u => u.isVerified);
    return createSuccess(users);
  }
}

/** Item repository with additional queries */
export class ItemRepository extends InMemoryRepository<BackendItem> {
  async findByOwner(ownerId: string): Promise<Result<BackendItem[]>> {
    const items = Array.from(this.store.values()).filter(i => i.ownerId === ownerId);
    return createSuccess(items);
  }

  async findByStatus(status: BackendItem['status']): Promise<Result<BackendItem[]>> {
    const items = Array.from(this.store.values()).filter(i => i.status === status);
    return createSuccess(items);
  }

  async findMostViewed(limit: number): Promise<Result<BackendItem[]>> {
    const items = Array.from(this.store.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
    return createSuccess(items);
  }
}
