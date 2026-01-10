import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	DocumentCategory,
	CreateDocumentCategoryDto,
	UpdateDocumentCategoryDto,
	DeleteDocumentCategoryResponse,
	ForceDeleteDocumentCategoryResponse,
} from './document-category.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class DocumentCategoryService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/document-categories`;

	constructor(private http: HttpClient) {}

	// Get all document categories with their sub-categories
	getCategories(): Observable<DocumentCategory[]> {
		return this.http.get<DocumentCategory[]>(this.apiUrl);
	}

	// Get single document category by ID
	getCategoryById(id: number): Observable<DocumentCategory> {
		return this.http.get<DocumentCategory>(`${this.apiUrl}/${id}`);
	}

	// Create new document category
	createCategory(
		categoryData: CreateDocumentCategoryDto
	): Observable<DocumentCategory> {
		return this.http.post<DocumentCategory>(this.apiUrl, categoryData);
	}

	// Update document category
	updateCategory(
		id: number,
		categoryData: UpdateDocumentCategoryDto
	): Observable<DocumentCategory> {
		return this.http.patch<DocumentCategory>(
			`${this.apiUrl}/${id}`,
			categoryData
		);
	}

	// Delete document category (soft delete - only if no documents)
	deleteCategory(id: number): Observable<DeleteDocumentCategoryResponse> {
		return this.http.delete<DeleteDocumentCategoryResponse>(
			`${this.apiUrl}/${id}`
		);
	}

	// Force delete document category (deletes all sub-categories and documents)
	forceDeleteCategory(
		id: number
	): Observable<ForceDeleteDocumentCategoryResponse> {
		return this.http.delete<ForceDeleteDocumentCategoryResponse>(
			`${this.apiUrl}/${id}/force`
		);
	}
}

