/**
 * Product model - another Entity implementation.
 * 
 * Test scenarios:
 * - "Find Implementations" of Repository shows both UserRepository and ProductRepository
 * - Rename ProductCategory and see all usages update
 * - "Find References" on Entity shows both User and Product
 */

import type { Entity, Repository, OperationResult } from '../core/types.js';
import { generateId, createTimestamps, success, failure, touchTimestamp } from '../core/utils.js';

/** Product categories */
export enum ProductCategory {
  Electronics = 'electronics',
  Clothing = 'clothing',
  Books = 'books',
  Home = 'home',
  Other = 'other',
}

/** Price with currency */
export interface Price {
  amount: number;
  currency: string;
}

/** Product entity - another implementation of Entity */
export interface Product extends Entity {
  name: string;
  description: string;
  sku: string;
  price: Price;
  category: ProductCategory;
  stockQuantity: number;
  tags: string[];
}

/** Creates a new product */
export function createProduct(
  name: string,
  description: string,
  sku: string,
  price: Price,
  category: ProductCategory
): Product {
  return {
    id: generateId(),
    ...createTimestamps(),
    isActive: true,
    name,
    description,
    sku,
    price,
    category,
    stockQuantity: 0,
    tags: [],
  };
}

/** In-memory product repository */
export class InMemoryProductRepository implements Repository<Product> {
  private products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async save(product: Product): Promise<OperationResult<Product>> {
    const updated = touchTimestamp(product);
    this.products.set(updated.id, updated);
    return success(updated);
  }

  async delete(id: string): Promise<OperationResult<void>> {
    if (this.products.has(id)) {
      this.products.delete(id);
      return success(undefined);
    }
    return failure(`Product with id ${id} not found`);
  }

  /** Find products by category */
  async findByCategory(category: ProductCategory): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  /** Find products by SKU */
  async findBySku(sku: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.sku === sku) {
        return product;
      }
    }
    return null;
  }

  /** Search products by name (case-insensitive) */
  async searchByName(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p =>
      p.name.toLowerCase().includes(lowerQuery)
    );
  }

  /** Get products with low stock */
  async findLowStock(threshold: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.stockQuantity < threshold);
  }
}

/** Formats a price for display */
export function formatPrice(price: Price): string {
  return `${price.currency} ${price.amount.toFixed(2)}`;
}

/** Checks if product is in stock */
export function isInStock(product: Product): boolean {
  return product.stockQuantity > 0 && product.isActive;
}
