import { DocumentSubCategory } from "../document-sub-category/document-sub-category.interface";

export interface DocumentCategory {
	categoryId: number;
	categoryName: string;
	description?: string;
	documentSubCategories?: DocumentSubCategory[];
	createdAt: Date | string;
	updatedAt: Date | string;
}


export interface CreateDocumentCategoryDto {
	categoryName: string;
	description?: string;
}

export interface UpdateDocumentCategoryDto {
	categoryName?: string;
	description?: string;
}

export interface DeleteDocumentCategoryResponse {
	success: boolean;
	message: string;
	categoryId: number;
	categoryName: string;
}

export interface ForceDeleteDocumentCategoryResponse {
	success: boolean;
	message: string;
	categoryId: number;
	categoryName: string;
	deletedSubCategoriesCount: number;
	deletedDocumentsCount: number;
}

