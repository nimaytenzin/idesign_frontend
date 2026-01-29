/**
 * Expense API – DTOs and entity matching POST/GET/PATCH/DELETE /expenses and GET /expenses/by-month
 */

export interface Expense {
	id: number;
	amount: number;
	description: string;
	date: string; // YYYY-MM-DD
	type?: string | null;
	subtype?: string | null;
	notes?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateExpenseDto {
	type?: string;
	subtype?: string;
	description: string;
	amount: number;
	date: string; // YYYY-MM-DD
	notes?: string;
}

export interface UpdateExpenseDto {
	type?: string;
	subtype?: string;
	description?: string;
	amount?: number;
	date?: string;
	notes?: string;
}

export interface ExpenseQueryDto {
	startDate?: string; // YYYY-MM-DD, include only date >= startDate
	endDate?: string;   // YYYY-MM-DD, include only date <= endDate
}

export interface ExpenseByMonthQueryDto {
	year: number;  // 2000–9999
	month: number; // 1–12
}

/** Item in ExpenseMonthlyReportResponseDto.byTypeAndSubtype */
export interface ExpenseByTypeSubtypeItemDto {
	type: string | null;
	subtype: string | null;
	count: number;
	totalAmount: number;
}

/** GET /expenses/monthly-report – expenses aggregated by type and subtype */
export interface ExpenseMonthlyReportResponseDto {
	year: number;
	month: number;
	byTypeAndSubtype: ExpenseByTypeSubtypeItemDto[];
}

/** GET /expenses/daily-stats – daily expense stats (date, totalAmount, count, byTypeAndSubtype) */
export interface ExpenseDailyStatsResponseDto {
	date: string; // YYYY-MM-DD
	totalAmount: number;
	count: number;
	byTypeAndSubtype: ExpenseByTypeSubtypeItemDto[];
}
