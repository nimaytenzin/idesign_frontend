// Affiliate Marketer Interfaces

export interface AffiliateMarketer {
	id: number;
	name: string;
	cid: string;
	email: string;
	voucherCode: string;
	discountPercentage: number; // Percentage discount for customers (0-100)
	commissionPercentage: number; // Commission percentage for affiliate (0-100)
	isActive: boolean;
	phoneNumber?: string;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface CreateAffiliateMarketerDto {
	name: string;
	cid: string;
	email: string;
	password: string;
	voucherCode: string;
	discountPercentage: number; // 0-100
	commissionPercentage: number; // 0-100
	isActive?: boolean;
	phoneNumber?: string;
}

export interface UpdateAffiliateMarketerDto {
	name?: string;
	cid?: string;
	email?: string;
	voucherCode?: string;
	discountPercentage?: number; // 0-100
	commissionPercentage?: number; // 0-100
	isActive?: boolean;
	phoneNumber?: string;
}

export interface ResetAffiliatePasswordDto {
	newPassword: string;
}

export interface ResetAffiliatePasswordResponse {
	message: string;
}

// Commission and Statistics Interfaces (from API documentation)
export interface AffiliateCommissionResponse {
	totalCommission: number;
	totalOrders: number;
	totalAmountSold: number;
}

export interface ProductSold {
	productId: number;
	productName?: string;
	quantity: number;
	totalAmount: number;
}

export interface AffiliateStatsResponse {
	totalOrders: number;
	totalAmountSold: number;
	totalCommission: number;
	productsSold: ProductSold[];
}

export interface MonthlyReportQuery {
	month?: number; // 1-12
	year?: number; // e.g., 2024
}

export interface MonthlyReportResponse {
	month: number;
	year: number;
	totalCommission: number;
	totalAmountSold: number;
	totalOrders: number;
	productsSold: ProductSold[];
}

