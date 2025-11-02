import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCategoryService } from '../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../core/dataservice/product-sub-category/product-sub-category.service';
import { ProductService } from '../core/dataservice/product/product.service';
import {
	ProductCategory,
	ProductSubCategory,
} from '../core/dataservice/product-category/product-category.interface';
import {
	Product,
	ProductQueryDto,
} from '../core/dataservice/product/product.interface';

@Component({
	selector: 'app-product-management-example',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="p-6">
			<h2 class="text-2xl font-bold mb-6">Product Management Example</h2>

			<!-- Categories Section -->
			<div class="mb-8">
				<h3 class="text-xl font-semibold mb-4">Categories</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div
						*ngFor="let category of categories"
						class="bg-white p-4 rounded-lg shadow"
					>
						<h4 class="font-medium">{{ category.name }}</h4>
						<p class="text-gray-600 text-sm">{{ category.description }}</p>
						<div class="mt-2">
							<span
								class="text-xs px-2 py-1 rounded"
								[class]="
									category.isActive
										? 'bg-green-100 text-green-800'
										: 'bg-gray-100 text-gray-800'
								"
							>
								{{ category.isActive ? 'Active' : 'Inactive' }}
							</span>
						</div>

						<!-- Sub-categories -->
						<div *ngIf="category.subCategories?.length" class="mt-3">
							<h5 class="text-sm font-medium mb-2">Sub-categories:</h5>
							<div class="space-y-1">
								<div
									*ngFor="let sub of category.subCategories"
									class="text-xs bg-gray-50 p-2 rounded"
								>
									{{ sub.name }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Products Section -->
			<div class="mb-8">
				<h3 class="text-xl font-semibold mb-4">Products</h3>

				<!-- Search and Filter Controls -->
				<div class="mb-4 flex gap-4">
					<input
						type="text"
						placeholder="Search products..."
						class="px-3 py-2 border rounded-lg"
						(input)="searchProducts($event)"
					/>
					<select
						class="px-3 py-2 border rounded-lg"
						(change)="sortProducts($event)"
					>
						<option value="">Sort by...</option>
						<option value="price_asc">Price: Low to High</option>
						<option value="price_desc">Price: High to Low</option>
						<option value="newest">Newest</option>
						<option value="rating">Rating</option>
						<option value="best_selling">Best Selling</option>
					</select>
				</div>

				<!-- Products Grid -->
				<div
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
				>
					<div
						*ngFor="let product of products"
						class="bg-white rounded-lg shadow overflow-hidden"
					>
						<img
							[src]="getPrimaryImage(product)"
							[alt]="product.title"
							class="w-full h-48 object-cover"
						/>
						<div class="p-4">
							<h4 class="font-semibold text-lg mb-2">{{ product.title }}</h4>
							<p class="text-gray-600 text-sm mb-2">
								{{ product.shortDescription }}
							</p>
							<div class="flex justify-between items-center mb-2">
								<span class="text-xl font-bold text-teal-600"
									>\${{ product.price }}</span
								>
								<span class="text-sm text-gray-500">{{
									product.material
								}}</span>
							</div>
							<div
								class="flex justify-between items-center text-sm text-gray-600"
							>
								<span>Stock: {{ product.stockQuantity }}</span>
								<span>Rating: {{ product.rating }}/5</span>
							</div>
							<div class="mt-2">
								<span
									class="text-xs px-2 py-1 rounded"
									[class]="
										product.isAvailable
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
									"
								>
									{{ product.isAvailable ? 'Available' : 'Out of Stock' }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Loading and Error States -->
			<div *ngIf="loading" class="text-center py-8">
				<p>Loading...</p>
			</div>

			<div
				*ngIf="error"
				class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
			>
				{{ error }}
			</div>
		</div>
	`,
})
export class ProductManagementExampleComponent implements OnInit {
	categories: ProductCategory[] = [];
	products: Product[] = [];
	loading = false;
	error: string | null = null;

	constructor(
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private productService: ProductService
	) {}

	ngOnInit() {
		this.loadCategories();
		this.loadProducts();
	}

	loadCategories() {
		this.loading = true;
		this.categoryService.getCategories().subscribe({
			next: (categories) => {
				this.categories = categories;
				// Load subcategories for each category
				categories.forEach((category) => {
					this.loadSubCategories(category.id, category);
				});
				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading categories:', error);
				this.error = 'Failed to load categories';
				this.loading = false;
			},
		});
	}

	loadSubCategories(categoryId: number, category: ProductCategory) {
		this.subCategoryService.getSubCategoriesByCategoryId(categoryId).subscribe({
			next: (subCategories) => {
				category.subCategories = subCategories;
			},
			error: (error) => {
				console.error('Error loading subcategories:', error);
			},
		});
	}

	loadProducts(query?: ProductQueryDto) {
		this.loading = true;
		this.productService.getProducts(query).subscribe({
			next: (products) => {
				this.products = products;
				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading products:', error);
				this.error = 'Failed to load products';
				this.loading = false;
			},
		});
	}

	getPrimaryImage(product: Product): string {
		const primaryImage = product.images?.find((img) => img.isPrimary);
		return primaryImage
			? primaryImage.imagePath
			: '/assets/images/no-image.png';
	}

	searchProducts(event: any) {
		const searchTerm = event.target.value;
		if (searchTerm.trim()) {
			this.loadProducts({ search: searchTerm });
		} else {
			this.loadProducts();
		}
	}

	sortProducts(event: any) {
		const sortBy = event.target.value;
		if (sortBy) {
			this.loadProducts({ sortBy: sortBy as any });
		} else {
			this.loadProducts();
		}
	}

	filterByCategory(category: string) {
		this.loadProducts({ category });
	}

	filterByMaterial(material: string) {
		this.loadProducts({ material });
	}

	filterByAvailability(availability: boolean) {
		this.loadProducts({ availability });
	}
}
