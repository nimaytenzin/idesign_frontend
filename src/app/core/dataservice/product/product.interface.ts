import { ProductSubCategory } from '../product-category/product-category.interface';

export interface ProductImage {
	id: number;
	productId: number;
	imagePath: string;
	fileName: string;
	orientation: 'portrait' | 'landscape' | 'square';
	isPrimary: boolean;
	altText?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Product {
	id: number;
	title: string;
	shortDescription: string;
	detailedDescription: string;
	dimensions: string;
	weight: number;
	price: number;
	material: string;
	stockQuantity: number;
	isAvailable: boolean;
	productSubCategoryId: number;
	rating: number;
	salesCount: number;
	productSubCategory?: ProductSubCategory;
	images: ProductImage[];
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateProductDto {
	title: string;
	shortDescription: string;
	detailedDescription: string;
	dimensions: string;
	weight: number;
	price: number;
	material: string;
	stockQuantity: number;
	isAvailable?: boolean;
	productSubCategoryId: number;
}

export interface UpdateProductDto {
	title?: string;
	shortDescription?: string;
	detailedDescription?: string;
	dimensions?: string;
	weight?: number;
	price?: number;
	material?: string;
	stockQuantity?: number;
	isAvailable?: boolean;
	productSubCategoryId?: number;
}

export interface ProductQueryDto {
	category?: string;
	sortBy?:
		| 'price_asc'
		| 'price_desc'
		| 'newest'
		| 'rating'
		| 'best_selling'
		| 'size';
	material?: string;
	availability?: boolean;
	search?: string;
}

export interface CreateProductImageDto {
	productId: number;
	imagePath: string;
	fileName: string;
	orientation?: 'portrait' | 'landscape' | 'square';
	isPrimary?: boolean;
	altText?: string;
}

export interface UpdateProductImageDto {
	imagePath?: string;
	fileName?: string;
	orientation?: 'portrait' | 'landscape' | 'square';
	isPrimary?: boolean;
	altText?: string;
}
