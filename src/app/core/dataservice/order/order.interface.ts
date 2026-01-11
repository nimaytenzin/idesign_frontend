

// Import AccountType from chart-of-accounts instead
import { AccountType } from '../chart-of-accounts/chart-of-accounts.interface';
import { Customer } from '../customer/customer.interface';
import { User } from '../user/user.interface';
import { DeliveryRate } from '../delivery-rate/delivery-rate.interface';
import { OrderSource, FulfillmentStatus, FulfillmentType, TransactionType, PaymentStatus } from '../../constants/enums';
import { PaymentMethod } from '../account/account.interface';
export { AccountType };
export { OrderSource, FulfillmentStatus, FulfillmentType, TransactionType, PaymentStatus };

// Order Item Interfaces (matching guide - orderItems)
export interface OrderItem {
	id: number; // PK
	orderId: number; // FK → Order
	productId: number; // FK → Product
	quantity: number;
	unitPrice: number;
	discountApplied: number;
	lineTotal: number;
	product?: any; // Product interface (when included)
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

export interface CreateOrderItemDto {
	productId: number; // Required
	quantity: number; // Required, min: 1
	unitPrice: number; // Required, min: 0
	discountApplied?: number; // Optional, min: 0
}

// Order Interfaces
export interface Order {
	// ============================================
	// Basic Information
	// ============================================
	id: number;
	orderNumber: string; // Unique
	customerId: number; // FK → Customer
	
	// ============================================
	// Order Classification
	// ============================================
	orderSource: OrderSource; // COUNTER | ONLINE
	fulfillmentStatus: FulfillmentStatus;
	fulfillmentType: FulfillmentType; // DELIVERY | PICKUP | INSTORE
	
	// ============================================
	// Financial Information
	// ============================================
	subTotal: number;
	discount: number;
	totalPayable: number;
	deliveryCost: number;
	voucherCode: string | null;
	
	// ============================================
	// Fulfillment Timestamps
	// ============================================
	placedAt: Date | null;
	confirmedAt: Date | null;
	processingAt: Date | null;
	shippingAt: Date | null;
	deliveredAt: Date | null;
	canceledAt: Date | null;
	
	// ============================================
	// Delivery Information
	// ============================================
	deliveryRateId?: number; // FK → DeliveryRate
	deliveryLocation?: string ; // Snapshotted from DeliveryLocation.name
	deliveryMode?: string ; // Snapshotted from DeliveryRate.transportMode
	shippingAddress?: string;
	deliveryNotes?: string; // Optional delivery notes
	driverName?: string ;
	driverPhone?: string ;
	vehicleNumber?: string ;
	expectedDeliveryDate?: Date ;
	
	// ============================================
	// Payment Information
	// ============================================
	paymentStatus: PaymentStatus; // PENDING | PAID | FAILED
	paymentMethod: PaymentMethod;
	paidAt: Date ;
	receiptGenerated: boolean;
	receiptNumber?: string ; // Unique
	
	// ============================================
	// User References
	// ============================================
	affiliateId?: number ; // FK → User
	servedBy?: number ; // FK → User
	
	// ============================================
	// Additional Information
	// ============================================
	feedbackToken?: string ;
	internalNotes?: string ;
	referrerSource?: string ;
	
	// ============================================
	// Relationships
	// ============================================
	customer?: Customer;
	servedByUser?: User;
	deliveryRate?: DeliveryRate;
	orderItems?: OrderItem[];
	orderDiscounts?: OrderDiscount[];
	transactions?: Transaction[];
	affiliateCommissions?: any[]; // AffiliateCommission[]
}

export interface CustomerDetailsDto {
	name?: string;
	email?: string;
	phoneNumber?: string;
	shippingAddress?: string;
	billingAddress?: string;
}

export interface CreateOrderDto {
	// Customer Information
	customer: CustomerDetailsDto; // Required
	
	// Order Items
	orderItems: CreateOrderItemDto[]; // Required, min 1 item
	
	// Order Classification
	orderSource?: OrderSource; // Optional (COUNTER | ONLINE)
	fulfillmentType?: FulfillmentType; // Optional (DELIVERY | PICKUP | INSTORE)
	
	// Payment Information
	paymentMethod?: PaymentMethod; // Optional (CASH | MBOB | BDB_EPAY | TPAY | BNB_MPAY | ZPSS)
	
	// Financial Information
	discount?: number; // Optional, min: 0
	voucherCode?: string; // Optional
	deliveryCost?: number; // Optional, min: 0
	
	// Delivery Information
	deliveryRateId?: number; // Required when fulfillmentType is DELIVERY
	shippingAddress?: string; // Required when fulfillmentType is DELIVERY
	deliveryNotes?: string; // Optional delivery notes
	
	// Additional Information
	internalNotes?: string; // Optional
	referrerSource?: string; // Optional
	
	// User References
	servedBy?: number; // Optional (auto-set for counter orders)
}

export interface UpdateOrderDto {
	orderItems?: CreateOrderItemDto[]; // Replaces all items
	deliveryCost?: number;
	internalNotes?: string;
	deliveryNotes?: string; // Optional delivery notes
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
	internalNotes?: string; // Optional - Internal notes about delivery
}

export interface ConfirmOrderDto {
	paymentMethod: PaymentMethod; // Required
	transactionId?: string; // Optional
	internalNotes?: string; // Optional
}

export interface ShipOrderDto {
	driverName: string; // Required - Name of the delivery driver
	driverPhone?: string; // Optional - Phone number of the driver
	vehicleNumber: string; // Required - Vehicle/car number/plate
	expectedDeliveryDate: string; // Required - Expected delivery date (ISO format)
	deliveryNotes?: string; // Optional delivery notes
}

export interface OrderQueryDto {
	customerId?: number;
	fulfillmentStatus?: FulfillmentStatus;
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
}

// Paginated Orders Query DTO
export interface GetOrdersPaginatedQueryDto {
	page?: number; // Page number (minimum: 1, default: 1)
	limit?: number; // Number of items per page (minimum: 1, maximum: 100, default: 10)
	fulfillmentStatus?: FulfillmentStatus; // Optional filter by fulfillment status
}

// Paginated Response DTO
export interface PaginatedResponseDto<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
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
	id: number; // PK
	orderId: number; // FK → Order
	discountId: number; // FK → Discount
	discountAmount: number;
	discountName: string;
	discountType: string;
	voucherCode?: string | null;
	appliedAt: Date | string; // Date or ISO date string
	createdAt?: Date | string;
	updatedAt?: Date | string;
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
