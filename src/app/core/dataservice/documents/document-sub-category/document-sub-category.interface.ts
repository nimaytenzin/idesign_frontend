// Re-export DocumentSubCategory from document-category

import { DocumentCategory } from "../document-category/document-category.interface";

 
export interface DocumentSubCategory {
	subCategoryId: number;
	categoryId: number;
	subCategoryName: string;
	category?: DocumentCategory;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface CreateDocumentSubCategoryDto {
	categoryId: number;
	subCategoryName: string;
}

export interface UpdateDocumentSubCategoryDto {
	categoryId?: number;
	subCategoryName?: string;
}

export interface ForceDeleteDocumentSubCategoryResponse {
	success: boolean;
	message: string;
	deletedDocumentsCount: number;
}

