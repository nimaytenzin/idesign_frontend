import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	DocumentSubCategory,
	CreateDocumentSubCategoryDto,
	UpdateDocumentSubCategoryDto,
	ForceDeleteDocumentSubCategoryResponse,
} from './document-sub-category.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class DocumentSubCategoryService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/document-sub-categories`;

	constructor(private http: HttpClient) {}

	// Get all document sub-categories
	getSubCategories(): Observable<DocumentSubCategory[]> {
		return this.http.get<DocumentSubCategory[]>(this.apiUrl);
	}

	// Get single document sub-category by ID
	getSubCategoryById(id: number): Observable<DocumentSubCategory> {
		return this.http.get<DocumentSubCategory>(`${this.apiUrl}/${id}`);
	}

	// Create new document sub-category
	createSubCategory(
		subCategoryData: CreateDocumentSubCategoryDto
	): Observable<DocumentSubCategory> {
		return this.http.post<DocumentSubCategory>(this.apiUrl, subCategoryData);
	}

	// Update document sub-category
	updateSubCategory(
		id: number,
		subCategoryData: UpdateDocumentSubCategoryDto
	): Observable<DocumentSubCategory> {
		return this.http.patch<DocumentSubCategory>(
			`${this.apiUrl}/${id}`,
			subCategoryData
		);
	}

	// Delete document sub-category (cascade deletes documents)
	deleteSubCategory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	// Force delete document sub-category and all its documents
	forceDeleteSubCategory(
		id: number
	): Observable<ForceDeleteDocumentSubCategoryResponse> {
		return this.http.delete<ForceDeleteDocumentSubCategoryResponse>(
			`${this.apiUrl}/${id}/force`
		);
	}
}

