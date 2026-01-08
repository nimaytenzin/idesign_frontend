/**
 * General Ledger Interfaces
 * Based on the General Ledger API documentation
 */

export type SourceType = 'ORDER' | 'EXPENSE' | 'MANUAL';

export interface GeneralLedgerEntry {
	id: number;
	date: string; // ISO date string
	accountCode: string;
	accountName: string;
	description: string;
	debitAmount: number;
	creditAmount: number;
	balance: number; // Running balance for this account
	referenceNumber: string;
	sourceType: SourceType;
	sourceId: number;
	sourceReference: string;
}

export interface GeneralLedgerPeriod {
	startDate: string | null; // ISO date string
	endDate: string | null; // ISO date string
}

export interface GeneralLedgerAccountSummary {
	accountCode: string;
	accountName: string;
	totalDebits: number;
	totalCredits: number;
	balance: number;
}

export interface GeneralLedgerSummary {
	totalDebits: number;
	totalCredits: number;
	netBalance: number;
}

export interface GeneralLedgerPagination {
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrevious: boolean;
}

export interface GeneralLedgerResponse {
	period: GeneralLedgerPeriod;
	totalTransactions: number;
	entries: GeneralLedgerEntry[];
	summary: GeneralLedgerSummary;
	accounts: GeneralLedgerAccountSummary[];
	pagination: GeneralLedgerPagination;
}

export interface GeneralLedgerQueryDto {
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
	year?: number; // Filter by year (use with month for month-wise filtering)
	month?: number; // Filter by month 1-12 (use with year for month-wise filtering)
	accountCode?: string;
	search?: string;
	page?: number;
	limit?: number;
}

/**
 * Profit & Loss (Income Statement) Interfaces
 * Based on the Profit & Loss API documentation
 */

export interface ProfitLossPeriod {
	startDate: string | null; // ISO date string
	endDate: string | null; // ISO date string
}

export interface ProfitLossTransaction {
	id: number;
	date: string; // ISO date string
	debitAmount?: number;
	creditAmount?: number;
	description: string;
	referenceNumber: string;
}

export interface RevenueAccount {
	accountCode: string;
	accountName: string;
	amount: number;
	transactions?: ProfitLossTransaction[];
}

export interface ExpenseAccount {
	accountCode: string;
	accountName: string;
	amount: number;
	transactions?: ProfitLossTransaction[];
}

export interface ProfitLossRevenue {
	total: number;
	breakdown?: RevenueAccount[];
}

export interface ProfitLossExpenses {
	total: number;
	breakdown?: ExpenseAccount[];
}

export interface ProfitLossResponseDto {
	period: ProfitLossPeriod;
	revenue: ProfitLossRevenue;
	expenses: ProfitLossExpenses;
	grossProfit: number;
	grossProfitMargin: number;
	netIncome: number;
	netProfitMargin: number;
}

export interface ProfitLossQueryDto {
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
	year?: number; // Filter by year (use with month for month-wise filtering)
	month?: number; // Filter by month 1-12 (use with year for month-wise filtering)
	format?: 'summary' | 'detailed'; // Default: 'detailed'
}

/**
 * Expense Recording Interfaces
 * Based on the Expense Recording API documentation
 */

export type PaymentMethod = 'CASH' | 'MBOB' | 'BDB_EPAY' | 'TPAY' | 'BNB_MPAY' | 'ZPSS';

export interface Expense {
	id: number;
	expenseDate: string; // ISO date string
	accountCode: string;
	amount: number;
	paymentMethod: PaymentMethod;
	description?: string;
	vendor?: string;
	receiptNumber?: string;
	receiptAttachment?: string;
	category?: string;
	isPosted: boolean;
	cashAccountCode: string;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export interface CreateExpenseDto {
	expenseDate: string; // ISO date string (YYYY-MM-DD)
	accountCode: string; // Expense account code (must be EXPENSE type)
	amount: number; // Must be >= 0
	paymentMethod: PaymentMethod;
	description?: string;
	vendor?: string;
	receiptNumber?: string;
	receiptAttachment?: string;
	category?: string;
	autoPost?: boolean; // Default: false
	cashAccountCode?: string; // Optional, auto-selected if not provided
}

export interface UpdateExpenseDto {
	expenseDate?: string;
	accountCode?: string;
	amount?: number;
	paymentMethod?: PaymentMethod;
	description?: string;
	vendor?: string;
	receiptNumber?: string;
	receiptAttachment?: string;
	category?: string;
	cashAccountCode?: string;
}

export interface ExpenseQueryDto {
	startDate?: string; // ISO date string
	endDate?: string; // ISO date string
	accountCode?: string;
	category?: string;
	vendor?: string;
	paymentMethod?: PaymentMethod;
	isPosted?: boolean;
	page?: number;
	limit?: number;
}

