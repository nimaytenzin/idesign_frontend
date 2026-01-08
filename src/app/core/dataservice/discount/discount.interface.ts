// Discount Enums
export enum DiscountType {
	FLAT_ALL_PRODUCTS = 'FLAT_ALL_PRODUCTS',
	FLAT_SELECTED_PRODUCTS = 'FLAT_SELECTED_PRODUCTS',
	FLAT_SELECTED_CATEGORIES = 'FLAT_SELECTED_CATEGORIES',
}

export enum DiscountValueType {
	PERCENTAGE = 'PERCENTAGE',
	FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum DiscountScope {
	PER_PRODUCT = 'PER_PRODUCT',
	ORDER_TOTAL = 'ORDER_TOTAL',
}

// Discount Junction Table Interfaces
export interface DiscountProduct {
	id: number;
	discountId: number;
	productId: number;
	discount?: Discount;
	product?: any; // Product type (to avoid circular dependency, can import Product if needed)
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

export interface DiscountCategory {
	id: number;
	discountId: number;
	categoryId: number;
	discount?: Discount;
	category?: any; // ProductCategory type (to avoid circular dependency)
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

export interface DiscountSubcategory {
	id: number;
	discountId: number;
	subCategoryId: number;
	discount?: Discount;
	subCategory?: any; // ProductSubCategory type (to avoid circular dependency)
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

// Discount Interfaces
export interface Discount {
	id: number;
	name: string;
	description?: string | null;
	discountType: DiscountType;
	valueType: DiscountValueType;
	discountValue: number; // Decimal(10, 2) - Percentage (0-100) or fixed amount
	discountScope: DiscountScope;
	startDate: Date | string; // ISO date string
	endDate: Date | string; // ISO date string
	isActive: boolean;
	maxUsageCount?: number | null;
	minOrderValue?: number | null; // Decimal(10, 2)
	voucherCode?: string | null;
	usageCount: number; // Default: 0
	createdAt?: Date | string;
	updatedAt?: Date | string;
	// Relationships (when populated)
	discountProducts?: DiscountProduct[];
	discountCategories?: DiscountCategory[];
	discountSubcategories?: DiscountSubcategory[];
	// Convenience arrays for frontend use
	productIds?: number[];
	categoryIds?: number[];
	subCategoryIds?: number[];
}

export interface CreateDiscountDto {
	name: string;
	description?: string | null;
	discountType: DiscountType;
	valueType: DiscountValueType;
	discountValue: number; // Decimal(10, 2)
	discountScope?: DiscountScope; // Default: 'PER_PRODUCT'
	startDate: string | Date; // ISO date string
	endDate: string | Date; // ISO date string
	isActive?: boolean; // Default: true
	maxUsageCount?: number | null;
	minOrderValue?: number | null; // Decimal(10, 2)
	voucherCode?: string | null;
	// For FLAT_SELECTED_PRODUCTS - array of product IDs
	productIds?: number[];
	// For FLAT_SELECTED_CATEGORIES - arrays of category and subcategory IDs
	categoryIds?: number[];
	subCategoryIds?: number[];
}

export interface UpdateDiscountDto {
	name?: string;
	description?: string | null;
	discountType?: DiscountType;
	valueType?: DiscountValueType;
	discountValue?: number; // Decimal(10, 2)
	discountScope?: DiscountScope;
	startDate?: string | Date;
	endDate?: string | Date;
	isActive?: boolean;
	maxUsageCount?: number | null;
	minOrderValue?: number | null; // Decimal(10, 2)
	voucherCode?: string | null;
	// For updating relationships
	productIds?: number[];
	categoryIds?: number[];
	subCategoryIds?: number[];
}

export interface DiscountResponseDto {
	id: number;
	name: string;
	description?: string;
	discountType: DiscountType;
	valueType: DiscountValueType;
	discountValue: number;
	discountScope: DiscountScope;
	startDate: string;
	endDate: string;
	isActive: boolean;
	maxUsageCount?: number | null;
	minOrderValue?: number | null;
	voucherCode?: string | null;
	usageCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface DiscountQueryDto {
	isActive?: boolean;
	discountType?: DiscountType;
}

// Discount Calculation Interfaces
export interface CalculateDiscountDto {
	orderItems: Array<{
		productId: number;
		quantity?: number; // Default: 1
		unitPrice?: number; // Default: 0
	}>;
	orderSubtotal?: number; // Optional: if provided, use this instead of calculating
	voucherCode?: string; // Optional voucher code to apply
}

export interface LineItemDiscount {
	productId: number;
	discountAmount: number;
	appliedDiscountId?: number;
	discountType?: string;
}

export interface DiscountCalculationResult {
	orderDiscount: number; // Total order-level discount
	lineItemDiscounts: LineItemDiscount[];
	appliedDiscounts: Discount[]; // Array of applied discount objects
	discountBreakdown: string; // Human-readable breakdown
	subtotalBeforeDiscount: number;
	subtotalAfterDiscount: number;
	finalTotal: number;
}

