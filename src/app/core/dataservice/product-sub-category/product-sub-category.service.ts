import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	ProductSubCategory,
	CreateProductSubCategoryDto,
	UpdateProductSubCategoryDto,
} from '../product-category/product-category.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ProductSubCategoryService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/product-sub-categories`;

	constructor(private http: HttpClient) {}

	// Get all product subcategories
	getSubCategories(): Observable<ProductSubCategory[]> {
		return this.http.get<ProductSubCategory[]>(this.apiUrl);
	}

	// Get subcategories by category ID
	getSubCategoriesByCategoryId(
		categoryId: number
	): Observable<ProductSubCategory[]> {
		return this.http.get<ProductSubCategory[]>(
			`${this.apiUrl}/by-category/${categoryId}`
		);
	}

	// Get subcategory by ID
	getSubCategoryById(id: number): Observable<ProductSubCategory> {
		return this.http.get<ProductSubCategory>(`${this.apiUrl}/${id}`);
	}

	// Create new subcategory
	createSubCategory(
		subCategoryData: CreateProductSubCategoryDto
	): Observable<ProductSubCategory> {
		return this.http.post<ProductSubCategory>(this.apiUrl, subCategoryData);
	}

	// Update subcategory
	updateSubCategory(
		id: number,
		subCategoryData: UpdateProductSubCategoryDto
	): Observable<ProductSubCategory> {
		return this.http.patch<ProductSubCategory>(
			`${this.apiUrl}/${id}`,
			subCategoryData
		);
	}

	// Delete subcategory
	deleteSubCategory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	// Toggle subcategory status
	toggleSubCategoryStatus(id: number): Observable<ProductSubCategory> {
		return this.http.patch<ProductSubCategory>(
			`${this.apiUrl}/${id}/toggle-status`,
			{}
		);
	}
}
