/**
 * API handlers - top-level request handlers using services.
 * 
 * Test scenarios:
 * - "Find References" traces from handlers down through all layers
 * - Rename handler functions and see all references update
 * - "Go to Definition" navigates through the full stack
 */

import type { OperationResult } from '../core/types.js';
import { formatDate } from '../core/utils.js';
import type { User } from '../models/user.js';
import { UserRole, InMemoryUserRepository } from '../models/user.js';
import type { Product, Price } from '../models/product.js';
import { ProductCategory, InMemoryProductRepository } from '../models/product.js';
import { UserService, authenticateUser, getUserDisplayInfo } from '../services/userService.js';
import { ProductService, calculateInventoryValue, groupByCategory } from '../services/productService.js';

/** Request context */
export interface RequestContext {
  userId?: string;
  timestamp: Date;
}

/** API response wrapper */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  requestedAt: string;
}

/** Creates an API response */
function createResponse<T>(result: OperationResult<T>, context: RequestContext): ApiResponse<T> {
  return {
    status: result.success ? 'success' : 'error',
    data: result.data,
    message: result.error,
    requestedAt: formatDate(context.timestamp),
  };
}

/** User API handler */
export class UserApiHandler {
  private service: UserService;

  constructor() {
    const repository = new InMemoryUserRepository();
    this.service = new UserService(repository);
  }

  /** Handle user registration request */
  async handleRegister(
    email: string,
    username: string,
    displayName: string,
    context: RequestContext
  ): Promise<ApiResponse<User>> {
    const result = await this.service.registerUser(email, username, displayName);
    return createResponse(result, context);
  }

  /** Handle get user request */
  async handleGetUser(id: string, context: RequestContext): Promise<ApiResponse<User | null>> {
    const user = await this.service.getUserById(id);
    return {
      status: user ? 'success' : 'error',
      data: user,
      message: user ? undefined : `User ${id} not found`,
      requestedAt: formatDate(context.timestamp),
    };
  }

  /** Handle list users request */
  async handleListUsers(context: RequestContext): Promise<ApiResponse<User[]>> {
    const users = await this.service.getAllUsers();
    return {
      status: 'success',
      data: users,
      requestedAt: formatDate(context.timestamp),
    };
  }

  /** Handle update profile request */
  async handleUpdateProfile(
    id: string,
    updates: Partial<Pick<User, 'displayName' | 'email'>>,
    context: RequestContext
  ): Promise<ApiResponse<User>> {
    const result = await this.service.updateUserProfile(id, updates);
    return createResponse(result, context);
  }

  /** Handle role change request */
  async handleChangeRole(
    targetUserId: string,
    newRole: UserRole,
    context: RequestContext
  ): Promise<ApiResponse<User>> {
    if (!context.userId) {
      return {
        status: 'error',
        message: 'Authentication required',
        requestedAt: formatDate(context.timestamp),
      };
    }
    const result = await this.service.changeUserRole(context.userId, targetUserId, newRole);
    return createResponse(result, context);
  }

  /** Handle deactivate user request */
  async handleDeactivateUser(id: string, context: RequestContext): Promise<ApiResponse<User>> {
    const result = await this.service.deactivateUser(id);
    return createResponse(result, context);
  }

  /** Handle delete user request */
  async handleDeleteUser(id: string, context: RequestContext): Promise<ApiResponse<void>> {
    const result = await this.service.deleteUser(id);
    return createResponse(result, context);
  }

  /** Validate user authentication */
  validateAuth(user: User, password: string): boolean {
    return authenticateUser(user, password);
  }

  /** Get user info for display */
  getUserInfo(user: User): string {
    return getUserDisplayInfo(user);
  }
}

/** Product API handler */
export class ProductApiHandler {
  private service: ProductService;

  constructor() {
    const repository = new InMemoryProductRepository();
    this.service = new ProductService(repository);
  }

  /** Handle create product request */
  async handleCreateProduct(
    name: string,
    description: string,
    sku: string,
    price: Price,
    category: ProductCategory,
    context: RequestContext
  ): Promise<ApiResponse<Product>> {
    const result = await this.service.createProduct(name, description, sku, price, category);
    return createResponse(result, context);
  }

  /** Handle get product request */
  async handleGetProduct(id: string, context: RequestContext): Promise<ApiResponse<Product | null>> {
    const product = await this.service.getProductById(id);
    return {
      status: product ? 'success' : 'error',
      data: product,
      message: product ? undefined : `Product ${id} not found`,
      requestedAt: formatDate(context.timestamp),
    };
  }

  /** Handle list products request */
  async handleListProducts(context: RequestContext): Promise<ApiResponse<Product[]>> {
    const products = await this.service.getAllProducts();
    return {
      status: 'success',
      data: products,
      requestedAt: formatDate(context.timestamp),
    };
  }

  /** Handle update stock request */
  async handleUpdateStock(
    id: string,
    quantity: number,
    context: RequestContext
  ): Promise<ApiResponse<Product>> {
    const result = await this.service.updateProductStock(id, quantity);
    return createResponse(result, context);
  }

  /** Handle update price request */
  async handleUpdatePrice(
    id: string,
    price: Price,
    context: RequestContext
  ): Promise<ApiResponse<Product>> {
    const result = await this.service.updateProductPrice(id, price);
    return createResponse(result, context);
  }

  /** Handle delete product request */
  async handleDeleteProduct(id: string, context: RequestContext): Promise<ApiResponse<void>> {
    const result = await this.service.deleteProduct(id);
    return createResponse(result, context);
  }

  /** Get inventory value */
  async getInventoryValue(): Promise<number> {
    const products = await this.service.getAllProducts();
    return calculateInventoryValue(products);
  }

  /** Get products grouped by category */
  async getProductsByCategory(): Promise<Map<ProductCategory, Product[]>> {
    const products = await this.service.getAllProducts();
    return groupByCategory(products);
  }
}
