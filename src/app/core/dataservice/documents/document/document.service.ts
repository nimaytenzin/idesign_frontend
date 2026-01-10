import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Document,
	CreateDocumentDto,
	UpdateDocumentDto,
	UpdateDocumentMetadataDto,
	DocumentQueryDto,
	IncrementVersionResponse,
} from './document.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class DocumentService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/documents`;

	constructor(private http: HttpClient) {}

	// Create new document with file upload
	createDocument(documentData: CreateDocumentDto): Observable<Document> {
		const formData = new FormData();

		// Append file
		formData.append('file', documentData.file);

		// Append other fields
		formData.append('subCategoryId', documentData.subCategoryId.toString());
		formData.append('userId', documentData.userId.toString());
		formData.append('documentTitle', documentData.documentTitle);

		if (documentData.versionNumber !== undefined) {
			formData.append(
				'versionNumber',
				documentData.versionNumber.toString()
			);
		}

		return this.http.post<Document>(this.apiUrl, formData);
	}

	// Get all documents with optional filters
	getDocuments(query?: DocumentQueryDto): Observable<Document[]> {
		let params = new HttpParams();
		if (query?.subCategoryId) {
			params = params.set('subCategoryId', query.subCategoryId.toString());
		}
		if (query?.userId) {
			params = params.set('userId', query.userId.toString());
		}
		return this.http.get<Document[]>(this.apiUrl, { params });
	}

	// Get single document by ID
	getDocumentById(id: number): Observable<Document> {
		return this.http.get<Document>(`${this.apiUrl}/${id}`);
	}

	// Update document metadata
	updateDocument(
		id: number,
		documentData: UpdateDocumentDto
	): Observable<Document> {
		return this.http.patch<Document>(
			`${this.apiUrl}/${id}`,
			documentData
		);
	}

	// Update document metadata only (title and sub-category)
	updateDocumentMetadata(
		id: number,
		metadata: UpdateDocumentMetadataDto
	): Observable<Document> {
		return this.http.patch<Document>(
			`${this.apiUrl}/${id}/metadata`,
			metadata
		);
	}

	// Download document file
	downloadDocument(id: number): Observable<Blob> {
		return this.http.get(`${this.apiUrl}/${id}/download`, {
			responseType: 'blob',
		});
	}

	// Increment document version
	incrementVersion(id: number): Observable<IncrementVersionResponse> {
		return this.http.patch<IncrementVersionResponse>(
			`${this.apiUrl}/${id}/increment-version`,
			{}
		);
	}

	// Delete document
	deleteDocument(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}

