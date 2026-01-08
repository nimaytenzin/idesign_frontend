import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Product,
	CreateProductDto,
	UpdateProductDto,
	ProductQueryDto,
	ProductImage,
	CreateProductImageDto,
	UpdateProductImageDto,
} from './product.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ProductService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/products`;

	constructor(private http: HttpClient) {}

	// Create new product
	createProduct(productData: CreateProductDto): Observable<Product> {
		return this.http.post<Product>(this.apiUrl, productData);
	}

	// Get all products (admin view)
	getAllProductsAdmin(): Observable<Product[]> {
		return this.http.get<Product[]>(`${this.apiUrl}/admin`);
	}

	// Get products with query/filtering (customer view)
	// Query Parameters:
	// - categoryId (optional): Filter by category
	// - subCategoryId (optional): Filter by subcategory
	// - isAvailable (optional): Filter by availability
	// - isFeatured (optional): Filter featured products
	getProducts(query?: ProductQueryDto): Observable<Product[]> {
		let params = new HttpParams();

		if (query) {
			// Support both old and new query parameter names
			if (query.categoryId) params = params.set('categoryId', query.categoryId.toString());
			if (query.category) params = params.set('categoryId', query.category); // Legacy support
			if (query.subCategoryId) params = params.set('subCategoryId', query.subCategoryId.toString());
			if (query.isAvailable !== undefined)
				params = params.set('isAvailable', query.isAvailable.toString());
			if (query.availability !== undefined)
				params = params.set('isAvailable', query.availability.toString()); // Legacy support
			if (query.isFeatured !== undefined)
				params = params.set('isFeatured', query.isFeatured.toString());
			if (query.sortBy) params = params.set('sortBy', query.sortBy);
			if (query.material) params = params.set('material', query.material);
			if (query.search) params = params.set('search', query.search);
		}

		return this.http.get<Product[]>(this.apiUrl, { params });
	}

	// Get featured products
	getFeaturedProducts(): Observable<Product[]> {
		return this.http.get<Product[]>(`${this.apiUrl}/featured`);
	}

	// Get product by ID
	getProductById(id: number): Observable<Product> {
		return this.http.get<Product>(`${this.apiUrl}/${id}`);
	}

	// Update product
	updateProduct(
		id: number,
		productData: UpdateProductDto
	): Observable<Product> {
		return this.http.patch<Product>(`${this.apiUrl}/${id}`, productData);
	}

	// Delete product
	deleteProduct(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	// Increment sales count
	incrementSales(id: number): Observable<Product> {
		return this.http.patch<Product>(`${this.apiUrl}/${id}/sales`, {});
	}

	// Update product rating
	updateRating(id: number, rating: number): Observable<Product> {
		return this.http.patch<Product>(`${this.apiUrl}/${id}/rating`, { rating });
	}

	// === Product Images ===

	// Upload multiple images to product
	uploadProductImages(
		productId: number,
		files: File[],
		metadata?: {
			orientations?: string[];
			altTexts?: string[];
			isPrimary?: boolean[];
		}
	): Observable<ProductImage[]> {
		const formData = new FormData();

		// Add files
		files.forEach((file) => {
			formData.append('images', file);
		});

		// Add metadata if provided
		if (metadata) {
			if (metadata.orientations) {
				formData.append('orientations', JSON.stringify(metadata.orientations));
			}
			if (metadata.altTexts) {
				formData.append('altTexts', JSON.stringify(metadata.altTexts));
			}
			if (metadata.isPrimary) {
				formData.append('isPrimary', JSON.stringify(metadata.isPrimary));
			}
		}

		return this.http.post<ProductImage[]>(
			`${this.apiUrl}/${productId}/images`,
			formData
		);
	}

	// Get all images for a product
	getProductImages(productId: number): Observable<ProductImage[]> {
		return this.http.get<ProductImage[]>(`${this.apiUrl}/${productId}/images`);
	}

	// Update image metadata
	updateProductImage(
		productId: number,
		imageId: number,
		imageData: UpdateProductImageDto
	): Observable<ProductImage> {
		return this.http.patch<ProductImage>(
			`${this.apiUrl}/${productId}/images/${imageId}`,
			imageData
		);
	}

	// Delete product image
	deleteProductImage(productId: number, imageId: number): Observable<void> {
		return this.http.delete<void>(
			`${this.apiUrl}/${productId}/images/${imageId}`
		);
	}

	// Set primary image
	setPrimaryImage(
		productId: number,
		imageId: number
	): Observable<ProductImage> {
		return this.http.patch<ProductImage>(
			`${this.apiUrl}/${productId}/images/${imageId}/primary`,
			{}
		);
	}
}
