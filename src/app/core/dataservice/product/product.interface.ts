import { ProductSubCategory } from '../product-category/product-category.interface';
import { Discount } from '../discount/discount.interface';

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
	weight: number; // FLOAT
	price: number; // FLOAT
	material: string | null;
	isAvailable: boolean; // Default: true
	isFeatured: boolean; // Default: false
	productSubCategoryId: number;
	rating: number; // FLOAT, Default: 0
	salesCount: number; // Default: 0
	productSubCategory?: ProductSubCategory;
	images: ProductImage[];
	discountProducts?: any[]; // DiscountProduct[] relationship (to avoid circular dependency)
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface CreateProductDto {
	title: string;
	shortDescription: string;
	detailedDescription: string;
	dimensions: string;
	weight: number;
	price: number;
	material?: string; // Optional
	isAvailable?: boolean; // Default: true
	isFeatured?: boolean; // Default: false
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
	isAvailable?: boolean;
	isFeatured?: boolean;
	productSubCategoryId?: number;
}

export interface ProductQueryDto {
	categoryId?: number; // Filter by category (matching guide)
	subCategoryId?: number; // Filter by subcategory (matching guide)
	isAvailable?: boolean; // Filter by availability (matching guide)
	isFeatured?: boolean; // Filter featured products (matching guide)
	// Legacy support
	category?: string | number;
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
