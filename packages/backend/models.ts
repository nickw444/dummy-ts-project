/**
 * Backend-specific models extending shared types.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - "Go to Definition" on UserDto navigates to shared package
 * - "Find Implementations" of SharedEntity includes these models
 * - Rename BackendUser and see repository updates
 */

import type { 
  UserDto, 
  ItemDto 
} from 'shared/types';
import { createEntityFields, touchEntity } from 'shared/utils';

/** Backend user model with additional server-side fields */
export interface BackendUser extends UserDto {
  passwordHash: string;
  lastLoginAt?: Date;
  loginCount: number;
  isVerified: boolean;
}

/** Backend item model with additional metadata */
export interface BackendItem extends ItemDto {
  views: number;
  lastViewedAt?: Date;
  internalNotes?: string;
}

/** Creates a new backend user */
export function createBackendUser(
  email: string,
  name: string,
  passwordHash: string,
  role: UserDto['role'] = 'user'
): BackendUser {
  return {
    ...createEntityFields(),
    email,
    name,
    role,
    passwordHash,
    loginCount: 0,
    isVerified: false,
  };
}

/** Creates a new backend item */
export function createBackendItem(
  title: string,
  description: string,
  ownerId: string,
  status: ItemDto['status'] = 'draft'
): BackendItem {
  return {
    ...createEntityFields(),
    title,
    description,
    ownerId,
    status,
    views: 0,
  };
}

/** Records a user login */
export function recordUserLogin(user: BackendUser): BackendUser {
  return touchEntity({
    ...user,
    lastLoginAt: new Date(),
    loginCount: user.loginCount + 1,
  });
}

/** Records an item view */
export function recordItemView(item: BackendItem): BackendItem {
  return touchEntity({
    ...item,
    views: item.views + 1,
    lastViewedAt: new Date(),
  });
}

/** Converts BackendUser to UserDto (strips sensitive fields) */
export function toUserDto(user: BackendUser): UserDto {
  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/** Converts BackendItem to ItemDto (strips internal fields) */
export function toItemDto(item: BackendItem): ItemDto {
  return {
    id: item.id,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    title: item.title,
    description: item.description,
    ownerId: item.ownerId,
    status: item.status,
  };
}
