/**
 * Main entry point - demonstrates usage of all modules.
 * 
 * This file ties together all packages and demonstrates:
 * - Cross-module imports and references
 * - Type usage across boundaries
 * - Function call tracing
 */

// Re-export all public APIs
export * from './core/index.js';
export * from './models/index.js';
export * from './services/index.js';
export * from './api/index.js';

// Import for demo usage
import { UserApiHandler, ProductApiHandler } from './api/handlers.js';
import type { RequestContext } from './api/handlers.js';
import { ProductCategory } from './models/product.js';
import { formatDate } from './core/utils.js';

/** Demo function showing the full application flow */
async function runDemo(): Promise<void> {
  console.log('=== TypeScript Refactoring Demo ===\n');

  // Initialize handlers
  const userHandler = new UserApiHandler();
  const productHandler = new ProductApiHandler();

  const context: RequestContext = {
    timestamp: new Date(),
  };

  // Create a user
  console.log('Creating user...');
  const userResponse = await userHandler.handleRegister(
    'john@example.com',
    'johndoe',
    'John Doe',
    context
  );
  console.log('User created:', userResponse.status);

  if (userResponse.data) {
    const userInfo = userHandler.getUserInfo(userResponse.data);
    console.log('User info:', userInfo);

    // Update context with user ID for authorized operations
    context.userId = userResponse.data.id;
  }

  // Create a product
  console.log('\nCreating product...');
  const productResponse = await productHandler.handleCreateProduct(
    'TypeScript Handbook',
    'Complete guide to TypeScript',
    'TS-BOOK-001',
    { amount: 49.99, currency: 'USD' },
    ProductCategory.Books,
    context
  );
  console.log('Product created:', productResponse.status);

  if (productResponse.data) {
    // Update stock
    console.log('\nUpdating stock...');
    await productHandler.handleUpdateStock(productResponse.data.id, 100, context);
    console.log('Stock updated');

    // Get inventory value
    const inventoryValue = await productHandler.getInventoryValue();
    console.log('Inventory value:', inventoryValue);
  }

  // List all users
  console.log('\nListing all users...');
  const usersResponse = await userHandler.handleListUsers(context);
  console.log('Users count:', usersResponse.data?.length ?? 0);

  // List all products
  console.log('\nListing all products...');
  const productsResponse = await productHandler.handleListProducts(context);
  console.log('Products count:', productsResponse.data?.length ?? 0);

  // Get products by category
  console.log('\nProducts by category:');
  const byCategory = await productHandler.getProductsByCategory();
  for (const [category, products] of byCategory) {
    console.log(`  ${category}: ${products.length} products`);
  }

  console.log('\n=== Demo Complete ===');
  console.log('Run date:', formatDate(new Date()));
}

// Run demo if this is the main module
runDemo().catch(console.error);
