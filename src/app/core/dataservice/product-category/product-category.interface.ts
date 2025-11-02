export interface ProductCategory {
	id: number;
	name: string;
	description?: string;
	isActive: boolean;
	subCategories?: ProductSubCategory[];
	createdAt: Date;
	updatedAt: Date;
}

export interface ProductSubCategory {
	id: number;
	name: string;
	description?: string;
	productCategoryId: number;
	isActive: boolean;
	productCategory?: ProductCategory;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateProductCategoryDto {
	name: string;
	description?: string;
	isActive?: boolean;
}

export interface UpdateProductCategoryDto {
	name?: string;
	description?: string;
	isActive?: boolean;
}

export interface CreateProductSubCategoryDto {
	name: string;
	description?: string;
	productCategoryId: number;
	isActive?: boolean;
}

export interface UpdateProductSubCategoryDto {
	name?: string;
	description?: string;
	productCategoryId?: number;
	isActive?: boolean;
}
