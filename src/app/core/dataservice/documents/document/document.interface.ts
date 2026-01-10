 import { User } from "../../user/user.interface";
import { DocumentSubCategory } from "../document-sub-category/document-sub-category.interface";

export interface Document {
	documentId: number;
	subCategoryId: number;
	userId: number;
	documentTitle: string;
	fileName: string;
	fileUrl: string;
	fileSize: number; // BigInt in backend, number in frontend
	fileType: string; // MIME type
	versionNumber: number;
	subCategory?: DocumentSubCategory;
	user?: User;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface CreateDocumentDto {
	file: File;
	subCategoryId: number;
	userId: number;
	documentTitle: string;
	versionNumber?: number; // Optional, defaults to 1
}

export interface UpdateDocumentDto {
	documentTitle?: string;
	subCategoryId?: number;
	versionNumber?: number;
}

export interface UpdateDocumentMetadataDto {
	documentTitle?: string;
	subCategoryId?: number;
}

export interface DocumentQueryDto {
	subCategoryId?: number;
	userId?: number;
}

export interface IncrementVersionResponse {
	documentId: number;
	versionNumber: number;
	[key: string]: any; // Other document fields
}

