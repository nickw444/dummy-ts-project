/**
 * Product service - business logic layer for product operations.
 * 
 * Test scenarios:
 * - "Find References" on ProductService
 * - "Go to Definition" on Product/Price navigates to models
 * - Rename "updateProductStock" across all call sites
 */

import type { Repository, OperationResult, EventHandler, EntityEvent } from '../core/types.js';
import { failure, touchTimestamp } from '../core/utils.js';
import type { Product, Price } from '../models/product.js';
import { createProduct, ProductCategory, formatPrice, isInStock } from '../models/product.js';

/** Product service for managing products */
export class ProductService {
  private eventHandlers: EventHandler<Product>[] = [];

  constructor(private readonly repository: Repository<Product>) {}

  /** Creates a new product */
  async createProduct(
    name: string,
    description: string,
    sku: string,
    price: Price,
    category: ProductCategory
  ): Promise<OperationResult<Product>> {
    const product = createProduct(name, description, sku, price, category);
    const result = await this.repository.save(product);
    
    if (result.success && result.data) {
      this.emitEvent('create', result.data);
    }
    
    return result;
  }

  /** Gets a product by ID */
  async getProductById(id: string): Promise<Product | null> {
    const product = await this.repository.findById(id);
    if (product) {
      this.emitEvent('read', product);
    }
    return product;
  }

  /** Gets all products */
  async getAllProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  /** Updates product stock quantity */
  async updateProductStock(id: string, quantity: number): Promise<OperationResult<Product>> {
    const product = await this.repository.findById(id);
    if (!product) {
      return failure(`Product with id ${id} not found`);
    }

    const updated = touchTimestamp({
      ...product,
      stockQuantity: quantity,
    });

    const result = await this.repository.save(updated);
    
    if (result.success && result.data) {
      this.emitEvent('update', result.data);
    }
    
    return result;
  }

  /** Updates product price */
  async updateProductPrice(id: string, price: Price): Promise<OperationResult<Product>> {
    const product = await this.repository.findById(id);
    if (!product) {
      return failure(`Product with id ${id} not found`);
    }

    const updated = touchTimestamp({
      ...product,
      price,
    });

    return this.repository.save(updated);
  }

  /** Adds tags to a product */
  async addProductTags(id: string, tags: string[]): Promise<OperationResult<Product>> {
    const product = await this.repository.findById(id);
    if (!product) {
      return failure(`Product with id ${id} not found`);
    }

    const uniqueTags = [...new Set([...product.tags, ...tags])];
    const updated = touchTimestamp({
      ...product,
      tags: uniqueTags,
    });

    return this.repository.save(updated);
  }

  /** Deactivates a product */
  async deactivateProduct(id: string): Promise<OperationResult<Product>> {
    const product = await this.repository.findById(id);
    if (!product) {
      return failure(`Product with id ${id} not found`);
    }

    const deactivated = touchTimestamp({
      ...product,
      isActive: false,
    });

    const result = await this.repository.save(deactivated);
    
    if (result.success && result.data) {
      this.emitEvent('update', result.data);
    }
    
    return result;
  }

  /** Deletes a product */
  async deleteProduct(id: string): Promise<OperationResult<void>> {
    const product = await this.repository.findById(id);
    if (product) {
      const result = await this.repository.delete(id);
      if (result.success) {
        this.emitEvent('delete', product);
      }
      return result;
    }
    return failure(`Product with id ${id} not found`);
  }

  /** Gets formatted price for a product */
  getFormattedPrice(product: Product): string {
    return formatPrice(product.price);
  }

  /** Checks if product is available for purchase */
  isAvailable(product: Product): boolean {
    return isInStock(product);
  }

  /** Subscribe to product events */
  onEvent(handler: EventHandler<Product>): void {
    this.eventHandlers.push(handler);
  }

  /** Emit an event to all handlers */
  private emitEvent(type: EntityEvent<Product>['type'], entity: Product): void {
    const event: EntityEvent<Product> = {
      type,
      entity,
      timestamp: new Date(),
    };
    this.eventHandlers.forEach(handler => handler(event));
  }
}

/** Calculates total value of products */
export function calculateInventoryValue(products: Product[]): number {
  return products.reduce((total, p) => total + p.price.amount * p.stockQuantity, 0);
}

/** Groups products by category */
export function groupByCategory(products: Product[]): Map<ProductCategory, Product[]> {
  const grouped = new Map<ProductCategory, Product[]>();
  
  for (const product of products) {
    const existing = grouped.get(product.category) ?? [];
    existing.push(product);
    grouped.set(product.category, existing);
  }
  
  return grouped;
}
