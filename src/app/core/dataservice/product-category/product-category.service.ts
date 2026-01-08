import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	ProductCategory,
	CreateProductCategoryDto,
	UpdateProductCategoryDto,
} from './product-category.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ProductCategoryService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/product-categories`;
	constructor(private http: HttpClient) {}

	// Get all product categories
	getCategories(): Observable<ProductCategory[]> {
		return this.http.get<ProductCategory[]>(this.apiUrl);
	}

	// Get category by ID
	getCategoryById(id: number): Observable<ProductCategory> {
		return this.http.get<ProductCategory>(`${this.apiUrl}/${id}`);
	}

	// Create new category
	createCategory(
		categoryData: CreateProductCategoryDto
	): Observable<ProductCategory> {
		return this.http.post<ProductCategory>(this.apiUrl, categoryData);
	}

	// Update category
	updateCategory(
		id: number,
		categoryData: UpdateProductCategoryDto
	): Observable<ProductCategory> {
		return this.http.patch<ProductCategory>(
			`${this.apiUrl}/${id}`,
			categoryData
		);
	}

	// Delete category
	deleteCategory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	// Toggle category status
	toggleCategoryStatus(id: number): Observable<ProductCategory> {
		return this.http.patch<ProductCategory>(
			`${this.apiUrl}/${id}/toggle-status`,
			{}
		);
	}
}
