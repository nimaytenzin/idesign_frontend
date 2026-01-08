// Enums
export enum FulfillmentStatus {
	PLACED = 'PLACED',
	CONFIRMED = 'CONFIRMED',
	PROCESSING = 'PROCESSING',
	SHIPPING = 'SHIPPING',
	DELIVERED = 'DELIVERED',
	CANCELED = 'CANCELED',
}

export enum PaymentStatus {
	PENDING = 'PENDING',
	PAID = 'PAID',
	FAILED = 'FAILED',
}

// Import PaymentMethod from account (not re-exported to avoid conflicts with account.interface.ts)
// Components should import PaymentMethod from account.interface.ts or from the index.ts barrel export
import type { PaymentMethod } from '../account/account.interface';

// Import AccountType from chart-of-accounts instead
import { AccountType } from '../chart-of-accounts/chart-of-accounts.interface';
export { AccountType };

export enum TransactionType {
	DEBIT = 'DEBIT',
	CREDIT = 'CREDIT',
}

export enum OrderType {
	COUNTER = 'COUNTER',
	ONLINE = 'ONLINE',
}

// Order Item Interfaces (matching guide - orderItems)
export interface OrderItem {
	id: number;
	orderId: number;
	productId: number;
	quantity: number;
	unitPrice: number;
	discountApplied: number;
	lineTotal: number;
	product?: any; // Product interface
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateOrderItemDto {
	productId: number; // Required
	quantity: number; // Required, minimum 1
	unitPrice: number; // Required, minimum 0
	discountApplied?: number; // Optional, calculated automatically
}

// Order Interfaces
export interface Order {
	id: number;
	orderNumber: string; // Format: ORD-YYYY-####
	customerId: number;
	orderDate: string; // ISO date string
	orderType: OrderType;
	totalAmount: number;
	orderDiscount: number;
	voucherCode?: string | null;
	fulfillmentStatus: FulfillmentStatus;
	paymentStatus: PaymentStatus;
	paymentDate?: string; // ISO date string
	paymentMethod?: PaymentMethod | null;
	transactionId?: string | null;
	shippingCost: number;
	internalNotes?: string | null;
	referrerSource?: string | null;
	feedbackToken?: string | null;
	lastUpdated: string; // ISO date string
	receiptGenerated: boolean;
	receiptNumber?: string; // Format: RCP-YYYY-####
	
	// Timestamp fields
	placedAt?: string; // ISO date string
	confirmedAt?: string; // ISO date string
	processingAt?: string; // ISO date string
	shippingAt?: string; // ISO date string
	deliveredAt?: string; // ISO date string
	canceledAt?: string; // ISO date string
	paidAt?: string; // ISO date string
	
	// Driver information (for SHIPPING status)
	driverName?: string | null;
	driverPhone?: string | null;
	vehicleNumber?: string | null;
	
	// Relations (when included)
	customer?: any; // Customer interface - import from customer module
	orderItems?: OrderItem[]; // Matching guide - orderItems
	orderDiscounts?: OrderDiscount[]; // Applied discounts
	transactions?: Transaction[];
	timeline?: OrderTimelineEvent[];
	
	// Customer-facing field (included in GET /orders/:id)
	customerStatusMessage?: string;
}

export interface CustomerDetailsDto {
	name?: string;
	email?: string;
	phoneNumber?: string;
	shippingAddress?: string;
	billingAddress?: string;
}

export interface CreateOrderDto {
	customer: CustomerDetailsDto;
	orderItems: CreateOrderItemDto[]; // Matching guide - orderItems
	orderType?: OrderType; // 'COUNTER' or 'ONLINE', default: 'ONLINE'
	paymentMethod?: PaymentMethod; // Optional
	orderDiscount?: number; // Optional, calculated automatically
	voucherCode?: string; // Optional voucher code
	shippingCost?: number; // Default: 0
	internalNotes?: string;
	referrerSource?: string; // Auto-extracted from referer header if not provided
}

export interface UpdateOrderDto {
	orderItems?: CreateOrderItemDto[]; // Replaces all items
	shippingCost?: number;
	internalNotes?: string;
}

export interface UpdateOrderStatusDto {
	fulfillmentStatus?: FulfillmentStatus; // Optional
	paymentStatus?: PaymentStatus; // Optional
	internalNotes?: string; // Optional
}

export interface UpdateFulfillmentStatusDto {
	fulfillmentStatus: FulfillmentStatus; // Required
	driverName?: string; // Required for SHIPPING status
	driverPhone?: string; // Required for SHIPPING status
	vehicleNumber?: string; // Required for SHIPPING status
	internalNotes?: string; // Optional
}

export interface UpdatePaymentStatusDto {
	paymentStatus: PaymentStatus; // Required
	paymentMethod?: PaymentMethod;
	transactionId?: string;
	internalNotes?: string; // Optional
}

export interface ProcessPaymentDto {
	paymentMethod: PaymentMethod; // Required
	paymentDate?: string; // Optional, ISO date string
	internalNotes?: string; // Optional
}

export interface VerifyOrderDto {
	internalNotes?: string; // Optional
}

export interface CancelOrderDto {
	reason?: string;
	internalNotes?: string;
}

export interface DeliverOrderDto {
	// Empty body or optional notes
}

export interface OrderQueryDto {
	customerId?: number;
	fulfillmentStatus?: FulfillmentStatus;
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
}

// Track Order DTO
export interface TrackOrderDto {
	orderNumber?: string; // At least one required
	phoneNumber?: string; // At least one required
}

export interface GetCustomerStatusDto {
	customerStatusMessage: string;
	fulfillmentStatus: FulfillmentStatus;
	paymentStatus: PaymentStatus;
	trackingNumber?: string;
}

// Order Discount Interface (for tracking applied discounts)
export interface OrderDiscount {
	id: number;
	orderId: number;
	discountId: number;
	discountName: string;
	discountType: string;
	discountAmount: number;
	voucherCode?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface OrderTimelineEvent {
	id: number;
	orderId: number;
	statusType: 'FULFILLMENT' | 'PAYMENT' | 'SYSTEM' | 'COMMUNICATION';
	eventValue: string; // e.g., 'SHIPPED', 'PAID'
	previousValue: string | null;
	metadata: any; // Flexible JSON (driver info, SMS details, etc.)
	note: string | null;
	userId: number | null;
	timestamp: Date;
}

export interface OrderTimeline {
	orderId: number;
	orderNumber: string;
	timeline: Array<{
		status: string;
		timestamp: string; // ISO date string
		description: string;
	}>;
}

// Monthly Orders Interfaces
export interface MonthQueryDto {
	year: number; // 1900-2100
	month: number; // 1-12
}

export interface OrdersByMonthResponseDto {
	year: number;
	month: number;
	startDate: string;
	endDate: string;
	totalOrders: number;
	orders: Order[];
}

export interface OrderStatisticsByMonthResponseDto {
	year: number;
	month: number;
	startDate: string;
	endDate: string;
	totalOrders: number;
	totalRevenue: number;
	totalShippingCost: number;
	averageOrderValue: number;
	ordersByStatus: {
		[key in FulfillmentStatus]?: number;
	};
	ordersByPaymentMethod: {
		[key: string]: number;
	};
	completedOrders: number;
	completedRevenue: number;
	cancelledOrders: number;
	pendingOrders: number;
}

// Chart of Accounts Interfaces
export interface ChartOfAccount {
	accountCode: string;
	accountName: string;
	accountType: AccountType;
	parentAccountCode?: string;
	description?: string;
	isActive: boolean;
	balance: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateChartOfAccountDto {
	accountCode: string;
	accountName: string;
	accountType: AccountType;
	parentAccountCode?: string;
	description?: string;
	isActive?: boolean;
}

export interface UpdateChartOfAccountDto {
	accountName?: string;
	accountType?: AccountType;
	parentAccountCode?: string;
	description?: string;
	isActive?: boolean;
}

// Transaction Interfaces
export interface Transaction {
	id: number;
	transactionDate: Date;
	accountCode: string;
	transactionType: TransactionType;
	amount: number;
	description?: string;
	referenceNumber?: string;
	orderId?: number;
	chartOfAccount?: ChartOfAccount;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateTransactionDto {
	transactionDate: string; // ISO date string
	accountCode: string;
	transactionType: TransactionType;
	amount: number;
	description?: string;
	referenceNumber?: string;
	orderId?: number;
}

export interface TransactionQueryDto {
	accountCode?: string;
	startDate?: string;
	endDate?: string;
	orderId?: number;
}

// Report Interfaces
export interface IncomeStatement {
	revenue: number;
	expenses: number;
	netIncome: number;
	period: {
		startDate: string | null;
		endDate: string | null;
	};
}

export interface BalanceSheet {
	assets: number;
	liabilities: number;
	equity: number;
	total: number;
	balanceCheck: boolean;
}
