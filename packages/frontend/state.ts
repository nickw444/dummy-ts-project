/**
 * Frontend state management.
 * 
 * PROJECT REFERENCES TEST SCENARIOS:
 * - "Find References" on DTOs shows state management usage
 * - Rename reducers and see component updates
 * - "Go to Definition" on shared validation
 */

import type { ItemDto } from 'shared/types';
import { validateEmail, validateName } from 'shared/validation';
import type { 
  UserState, 
  ItemsState, 
  UserAction, 
  ItemAction,
  UserFormState,
  ItemFormState,
  Notification 
} from './types.js';

/** Initial user state */
export function createInitialUserState(): UserState {
  return {
    user: null,
    isLoading: false,
    error: null,
  };
}

/** Initial items state */
export function createInitialItemsState(): ItemsState {
  return {
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
    },
  };
}

/** Initial user form state */
export function createInitialUserFormState(): UserFormState {
  return {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    errors: {},
    isSubmitting: false,
  };
}

/** Initial item form state */
export function createInitialItemFormState(): ItemFormState {
  return {
    title: '',
    description: '',
    status: 'draft',
    errors: {},
    isSubmitting: false,
  };
}

/** User state reducer */
export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    case 'CLEAR_USER':
      return { ...state, user: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

/** Items state reducer */
export function itemsReducer(state: ItemsState, action: ItemAction): ItemsState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, error: null };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        selectedItem: state.selectedItem?.id === action.payload.id
          ? action.payload
          : state.selectedItem,
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        selectedItem: state.selectedItem?.id === action.payload
          ? null
          : state.selectedItem,
      };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    default:
      return state;
  }
}

/** Validates user form */
export function validateUserForm(form: UserFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(form.email);
  if (!emailResult.ok && emailResult.errors) {
    errors['email'] = emailResult.errors[0]?.message ?? 'Invalid email';
  }

  const nameResult = validateName(form.name);
  if (!nameResult.ok && nameResult.errors) {
    errors['name'] = nameResult.errors[0]?.message ?? 'Invalid name';
  }

  if (form.password.length < 8) {
    errors['password'] = 'Password must be at least 8 characters';
  }

  if (form.password !== form.confirmPassword) {
    errors['confirmPassword'] = 'Passwords do not match';
  }

  return errors;
}

/** Validates item form */
export function validateItemForm(form: ItemFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  const titleResult = validateName(form.title, 'title');
  if (!titleResult.ok && titleResult.errors) {
    errors['title'] = titleResult.errors[0]?.message ?? 'Invalid title';
  }

  if (!form.description || form.description.trim().length === 0) {
    errors['description'] = 'Description is required';
  }

  return errors;
}

/** Notification manager */
export class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private idCounter = 0;

  /** Adds a notification */
  add(
    type: Notification['type'],
    message: string,
    duration: number = 5000
  ): string {
    const id = `notification-${++this.idCounter}`;
    const notification: Notification = { id, type, message, duration };
    this.notifications = [...this.notifications, notification];
    this.notifyListeners();

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  /** Removes a notification */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /** Subscribes to notification changes */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /** Gets current notifications */
  getAll(): Notification[] {
    return this.notifications;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}

/** Selects user display name */
export function selectUserDisplayName(state: UserState): string {
  return state.user?.name ?? 'Guest';
}

/** Selects items count */
export function selectItemsCount(state: ItemsState): number {
  return state.items.length;
}

/** Selects published items */
export function selectPublishedItems(state: ItemsState): ItemDto[] {
  return state.items.filter(item => item.status === 'published');
}
