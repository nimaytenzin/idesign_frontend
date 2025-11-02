# iDesign Data Services & DTOs

This document explains the data services and DTOs structure for the iDesign 3D printing application.

## 📁 Project Structure

```
src/app/core/dataservice/
├── index.ts                          # Main export file for all services
├── product-category/
│   ├── product-category.interface.ts # Category & SubCategory interfaces
│   └── product-category.service.ts   # Category service
├── product-sub-category/
│   └── product-sub-category.service.ts # SubCategory service
├── product/
│   ├── product.interface.ts          # Product & ProductImage interfaces
│   └── product.service.ts            # Product service with image handling
├── auth/                             # Existing auth services
├── dzonkhag/                         # Existing location services
├── config.service.ts                 # Existing config service
└── session.service.ts                # Existing session service
```

## 🏷️ Available Interfaces & DTOs

### Product Category Interfaces
- `ProductCategory` - Main category entity
- `ProductSubCategory` - Sub-category entity
- `CreateProductCategoryDto` - Create category payload
- `UpdateProductCategoryDto` - Update category payload
- `CreateProductSubCategoryDto` - Create sub-category payload
- `UpdateProductSubCategoryDto` - Update sub-category payload

### Product Interfaces
- `Product` - Main product entity with relationships
- `ProductImage` - Product image entity
- `CreateProductDto` - Create product payload
- `UpdateProductDto` - Update product payload
- `ProductQueryDto` - Query/filter parameters
- `CreateProductImageDto` - Create image payload
- `UpdateProductImageDto` - Update image payload

## 🔧 Available Services

### ProductCategoryService
```typescript
// Get all categories
getCategories(): Observable<ProductCategory[]>

// Get category by ID
getCategoryById(id: number): Observable<ProductCategory>

// Create new category
createCategory(data: CreateProductCategoryDto): Observable<ProductCategory>

// Update category
updateCategory(id: number, data: UpdateProductCategoryDto): Observable<ProductCategory>

// Delete category
deleteCategory(id: number): Observable<void>
```

### ProductSubCategoryService
```typescript
// Get all sub-categories
getSubCategories(): Observable<ProductSubCategory[]>

// Get sub-categories by category ID
getSubCategoriesByCategoryId(categoryId: number): Observable<ProductSubCategory[]>

// Get sub-category by ID
getSubCategoryById(id: number): Observable<ProductSubCategory>

// Create new sub-category
createSubCategory(data: CreateProductSubCategoryDto): Observable<ProductSubCategory>

// Update sub-category
updateSubCategory(id: number, data: UpdateProductSubCategoryDto): Observable<ProductSubCategory>

// Delete sub-category
deleteSubCategory(id: number): Observable<void>
```

### ProductService
```typescript
// === Product CRUD ===
createProduct(data: CreateProductDto): Observable<Product>
getAllProductsAdmin(): Observable<Product[]>
getProducts(query?: ProductQueryDto): Observable<Product[]>
getProductById(id: number): Observable<Product>
updateProduct(id: number, data: UpdateProductDto): Observable<Product>
deleteProduct(id: number): Observable<void>

// === Product Analytics ===
incrementSales(id: number): Observable<Product>
updateRating(id: number, rating: number): Observable<Product>

// === Image Management ===
uploadProductImages(productId: number, files: File[], metadata?): Observable<ProductImage[]>
getProductImages(productId: number): Observable<ProductImage[]>
updateProductImage(productId: number, imageId: number, data: UpdateProductImageDto): Observable<ProductImage>
deleteProductImage(productId: number, imageId: number): Observable<void>
setPrimaryImage(productId: number, imageId: number): Observable<ProductImage>
```

## 📱 Usage Examples

### Basic Component Integration
```typescript
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../core/dataservice/product/product.service';
import { Product, ProductQueryDto } from '../core/dataservice/product/product.interface';

@Component({
  selector: 'app-products',
  template: `
    <div *ngFor="let product of products" class="product-card">
      <img [src]="getPrimaryImage(product)" [alt]="product.title">
      <h3>{{ product.title }}</h3>
      <p>\${{ product.price }}</p>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(query?: ProductQueryDto) {
    this.productService.getProducts(query).subscribe({
      next: (products) => this.products = products,
      error: (error) => console.error('Error:', error)
    });
  }

  getPrimaryImage(product: Product): string {
    const primaryImage = product.images?.find(img => img.isPrimary);
    return primaryImage ? primaryImage.imagePath : '/assets/images/no-image.png';
  }

  // Filter by category
  filterByCategory(category: string) {
    this.loadProducts({ category });
  }

  // Search products
  searchProducts(searchTerm: string) {
    this.loadProducts({ search: searchTerm });
  }

  // Sort products
  sortProducts(sortBy: 'price_asc' | 'price_desc' | 'newest' | 'rating') {
    this.loadProducts({ sortBy });
  }
}
```

### Image Upload Example
```typescript
import { Component } from '@angular/core';
import { ProductService } from '../core/dataservice/product/product.service';

@Component({
  selector: 'app-product-images',
  template: `
    <input type="file" multiple accept="image/*" (change)="onFilesSelected($event)">
    <button (click)="uploadImages()" [disabled]="!selectedFiles.length">
      Upload Images
    </button>
  `
})
export class ProductImagesComponent {
  selectedFiles: File[] = [];
  productId = 1; // Set the product ID

  constructor(private productService: ProductService) {}

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadImages() {
    if (this.selectedFiles.length > 0) {
      const metadata = {
        orientations: this.selectedFiles.map(() => 'landscape'),
        altTexts: this.selectedFiles.map(file => file.name),
        isPrimary: this.selectedFiles.map((_, index) => index === 0) // First image as primary
      };

      this.productService.uploadProductImages(this.productId, this.selectedFiles, metadata)
        .subscribe({
          next: (images) => {
            console.log('Images uploaded successfully:', images);
            this.selectedFiles = [];
          },
          error: (error) => console.error('Upload failed:', error)
        });
    }
  }
}
```

### Category Management Example
```typescript
import { Component, OnInit } from '@angular/core';
import { ProductCategoryService } from '../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../core/dataservice/product-sub-category/product-sub-category.service';
import { ProductCategory, CreateProductCategoryDto } from '../core/dataservice/product-category/product-category.interface';

@Component({
  selector: 'app-category-management',
  template: `
    <div>
      <h2>Categories</h2>
      <div *ngFor="let category of categories">
        <h3>{{ category.name }}</h3>
        <button (click)="loadSubCategories(category.id)">Load Sub-categories</button>
        <div *ngIf="category.subCategories">
          <div *ngFor="let sub of category.subCategories">
            {{ sub.name }}
          </div>
        </div>
      </div>
      
      <form (ngSubmit)="createCategory()">
        <input [(ngModel)]="newCategory.name" placeholder="Category Name" required>
        <textarea [(ngModel)]="newCategory.description" placeholder="Description"></textarea>
        <button type="submit">Create Category</button>
      </form>
    </div>
  `
})
export class CategoryManagementComponent implements OnInit {
  categories: ProductCategory[] = [];
  newCategory: CreateProductCategoryDto = { name: '', description: '' };

  constructor(
    private categoryService: ProductCategoryService,
    private subCategoryService: ProductSubCategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadSubCategories(categoryId: number) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      this.subCategoryService.getSubCategoriesByCategoryId(categoryId).subscribe({
        next: (subCategories) => category.subCategories = subCategories,
        error: (error) => console.error('Error loading sub-categories:', error)
      });
    }
  }

  createCategory() {
    this.categoryService.createCategory(this.newCategory).subscribe({
      next: (category) => {
        this.categories.push(category);
        this.newCategory = { name: '', description: '' };
      },
      error: (error) => console.error('Error creating category:', error)
    });
  }
}
```

## 🌐 Environment Configuration

The services use the environment configuration for API base URLs:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  BASEAPI_URL: 'http://localhost:3000',
  APPNAME: 'iDesign',
  APPSLOGAN: 'Crafting Sacred Art with 3D Precision',
};
```

**Production** (`src/environments/environment.production.ts`):
```typescript
export const environment = {
  BASEAPI_URL: 'https://idesign.ddnsfree.com/api',
  APPNAME: 'iDesign',
  APPSLOGAN: 'Crafting Sacred Art with 3D Precision',
};
```

## 🔗 Import Patterns

### Individual Service Imports
```typescript
import { ProductService } from '../core/dataservice/product/product.service';
import { ProductCategoryService } from '../core/dataservice/product-category/product-category.service';
```

### Interface Imports
```typescript
import { Product, ProductQueryDto } from '../core/dataservice/product/product.interface';
import { ProductCategory } from '../core/dataservice/product-category/product-category.interface';
```

### Bulk Imports (using index.ts)
```typescript
import { 
  ProductService, 
  ProductCategoryService,
  Product,
  ProductCategory 
} from '../core/dataservice';
```

## 📝 Best Practices

1. **Error Handling**: Always implement error handling in your observables
2. **Loading States**: Show loading indicators during API calls
3. **Type Safety**: Use the provided interfaces for type checking
4. **Image Handling**: Use the `getPrimaryImage()` helper for displaying product images
5. **Query Optimization**: Use `ProductQueryDto` for efficient filtering and sorting
6. **File Uploads**: Use FormData for image uploads with proper metadata

## 🚀 Quick Start

1. Import the required services in your component
2. Inject services through constructor
3. Use observables with proper error handling
4. Implement loading states for better UX
5. Use the provided interfaces for type safety

For a complete working example, see `src/app/examples/product-management-example.component.ts`.