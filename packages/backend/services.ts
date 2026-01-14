/**
 * Backend service layer.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - "Find References" on validation functions from shared
 * - Rename service methods and see handler updates
 * - "Go to Definition" traces through the full stack
 */

import type { 
  Result, 
  UserDto, 
  ItemDto, 
  PaginationParams, 
  PaginatedResponse,
  SharedEvent
} from 'shared/types';
import type { ValidationError } from 'shared/validation';
import { 
  createSuccess, 
  createError, 
  unwrapResult
} from 'shared/utils';
import { 
  validateUserDto, 
  validateItemDto 
} from 'shared/validation';
import type { BackendUser, BackendItem } from './models.js';
import { 
  createBackendUser, 
  createBackendItem, 
  recordUserLogin,
  recordItemView,
  toUserDto, 
  toItemDto 
} from './models.js';
import type { UserRepository, ItemRepository } from './repository.js';

/** Event emitter type */
type EventEmitter<T> = (event: SharedEvent<T>) => void;

/** User service */
export class UserService {
  private eventEmitters: EventEmitter<UserDto>[] = [];

  constructor(private readonly repository: UserRepository) {}

  /** Registers a new user */
  async registerUser(
    email: string,
    name: string,
    password: string,
    role: UserDto['role'] = 'user'
  ): Promise<Result<UserDto>> {
    // Validate input
    const validation = validateUserDto({ email, name, role });
    if (!validation.ok) {
      return createError(`Validation failed: ${validation.errors?.map((e: ValidationError) => e.message).join(', ')}`);
    }

    // Check email uniqueness
    const existing = await this.repository.findByEmail(email);
    if (existing.ok) {
      return createError('Email already in use');
    }

    // Create user
    const passwordHash = await this.hashPassword(password);
    const user = createBackendUser(email, name, passwordHash, role);
    
    const saveResult = await this.repository.save(user);
    if (!saveResult.ok) {
      return createError(saveResult.error ?? 'Failed to save user');
    }

    const dto = toUserDto(unwrapResult(saveResult));
    this.emitEvent('created', dto);
    return createSuccess(dto);
  }

  /** Authenticates a user */
  async authenticateUser(email: string, password: string): Promise<Result<UserDto>> {
    const userResult = await this.repository.findByEmail(email);
    if (!userResult.ok) {
      return createError('Invalid credentials');
    }

    const user = unwrapResult(userResult);
    const validPassword = await this.verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return createError('Invalid credentials');
    }

    // Record login
    const updatedUser = recordUserLogin(user);
    await this.repository.save(updatedUser);

    return createSuccess(toUserDto(updatedUser));
  }

  /** Gets a user by ID */
  async getUserById(id: string): Promise<Result<UserDto>> {
    const result = await this.repository.findById(id);
    if (!result.ok) {
      return createError(result.error ?? 'User not found');
    }
    return createSuccess(toUserDto(unwrapResult(result)));
  }

  /** Lists users with pagination */
  async listUsers(params: PaginationParams): Promise<Result<PaginatedResponse<UserDto>>> {
    const result = await this.repository.findPaginated(params);
    if (!result.ok) {
      return createError(result.error ?? 'Failed to list users');
    }
    
    const page = unwrapResult(result);
    return createSuccess({
      ...page,
      items: page.items.map(toUserDto),
    });
  }

  /** Updates a user */
  async updateUser(id: string, updates: Partial<Pick<UserDto, 'name' | 'role'>>): Promise<Result<UserDto>> {
    const existingResult = await this.repository.findById(id);
    if (!existingResult.ok) {
      return createError(existingResult.error ?? 'User not found');
    }

    const existing = unwrapResult(existingResult);
    const updated: BackendUser = {
      ...existing,
      ...updates,
    };

    const saveResult = await this.repository.save(updated);
    if (!saveResult.ok) {
      return createError(saveResult.error ?? 'Failed to update user');
    }

    const dto = toUserDto(unwrapResult(saveResult));
    this.emitEvent('updated', dto);
    return createSuccess(dto);
  }

  /** Deletes a user */
  async deleteUser(id: string): Promise<Result<void>> {
    const existingResult = await this.repository.findById(id);
    if (!existingResult.ok) {
      return createError(existingResult.error ?? 'User not found');
    }

    const dto = toUserDto(unwrapResult(existingResult));
    const result = await this.repository.delete(id);
    
    if (result.ok) {
      this.emitEvent('deleted', dto);
    }
    
    return result;
  }

  /** Subscribe to user events */
  onEvent(emitter: EventEmitter<UserDto>): void {
    this.eventEmitters.push(emitter);
  }

  private emitEvent(type: SharedEvent<UserDto>['type'], payload: UserDto): void {
    const event: SharedEvent<UserDto> = {
      type,
      payload,
      timestamp: new Date(),
      source: 'backend',
    };
    this.eventEmitters.forEach(emit => emit(event));
  }

  private async hashPassword(password: string): Promise<string> {
    // Simplified - real implementation would use bcrypt
    return `hashed_${password}`;
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return hash === `hashed_${password}`;
  }
}

/** Item service */
export class ItemService {
  private eventEmitters: EventEmitter<ItemDto>[] = [];

  constructor(private readonly repository: ItemRepository) {}

  /** Creates a new item */
  async createItem(
    title: string,
    description: string,
    ownerId: string,
    status: ItemDto['status'] = 'draft'
  ): Promise<Result<ItemDto>> {
    // Validate input
    const validation = validateItemDto({ title, description, ownerId, status });
    if (!validation.ok) {
      return createError(`Validation failed: ${validation.errors?.map((e: ValidationError) => e.message).join(', ')}`);
    }

    const item = createBackendItem(title, description, ownerId, status);
    const saveResult = await this.repository.save(item);
    
    if (!saveResult.ok) {
      return createError(saveResult.error ?? 'Failed to save item');
    }

    const dto = toItemDto(unwrapResult(saveResult));
    this.emitEvent('created', dto);
    return createSuccess(dto);
  }

  /** Gets an item by ID */
  async getItemById(id: string): Promise<Result<ItemDto>> {
    const result = await this.repository.findById(id);
    if (!result.ok) {
      return createError(result.error ?? 'Item not found');
    }

    // Record view
    const item = unwrapResult(result);
    const viewed = recordItemView(item);
    await this.repository.save(viewed);

    return createSuccess(toItemDto(viewed));
  }

  /** Lists items with pagination */
  async listItems(params: PaginationParams): Promise<Result<PaginatedResponse<ItemDto>>> {
    const result = await this.repository.findPaginated(params);
    if (!result.ok) {
      return createError(result.error ?? 'Failed to list items');
    }
    
    const page = unwrapResult(result);
    return createSuccess({
      ...page,
      items: page.items.map(toItemDto),
    });
  }

  /** Gets items by owner */
  async getItemsByOwner(ownerId: string): Promise<Result<ItemDto[]>> {
    const result = await this.repository.findByOwner(ownerId);
    if (!result.ok) {
      return createError(result.error ?? 'Failed to get items');
    }
    return createSuccess(unwrapResult(result).map(toItemDto));
  }

  /** Updates item status */
  async updateItemStatus(id: string, status: ItemDto['status']): Promise<Result<ItemDto>> {
    const existingResult = await this.repository.findById(id);
    if (!existingResult.ok) {
      return createError(existingResult.error ?? 'Item not found');
    }

    const existing = unwrapResult(existingResult);
    const updated: BackendItem = {
      ...existing,
      status,
    };

    const saveResult = await this.repository.save(updated);
    if (!saveResult.ok) {
      return createError(saveResult.error ?? 'Failed to update item');
    }

    const dto = toItemDto(unwrapResult(saveResult));
    this.emitEvent('updated', dto);
    return createSuccess(dto);
  }

  /** Deletes an item */
  async deleteItem(id: string): Promise<Result<void>> {
    const existingResult = await this.repository.findById(id);
    if (!existingResult.ok) {
      return createError(existingResult.error ?? 'Item not found');
    }

    const dto = toItemDto(unwrapResult(existingResult));
    const result = await this.repository.delete(id);
    
    if (result.ok) {
      this.emitEvent('deleted', dto);
    }
    
    return result;
  }

  /** Subscribe to item events */
  onEvent(emitter: EventEmitter<ItemDto>): void {
    this.eventEmitters.push(emitter);
  }

  private emitEvent(type: SharedEvent<ItemDto>['type'], payload: ItemDto): void {
    const event: SharedEvent<ItemDto> = {
      type,
      payload,
      timestamp: new Date(),
      source: 'backend',
    };
    this.eventEmitters.forEach(emit => emit(event));
  }
}
