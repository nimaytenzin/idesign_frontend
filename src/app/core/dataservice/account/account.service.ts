import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	GeneralLedgerResponse,
	GeneralLedgerQueryDto,
	ProfitLossResponseDto,
	ProfitLossQueryDto,
	Expense,
	CreateExpenseDto,
	UpdateExpenseDto,
	ExpenseQueryDto,
} from './account.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AccountService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/accounts`;

	constructor(private http: HttpClient) {}

	/**
	 * Get General Ledger report
	 * @param query Query parameters for filtering and pagination
	 * @returns Observable of GeneralLedgerResponse
	 */
	getGeneralLedger(query?: GeneralLedgerQueryDto): Observable<GeneralLedgerResponse> {
		let params = new HttpParams();

		if (query) {
			// Year and month take precedence over startDate/endDate
			if (query.year !== undefined) {
				params = params.set('year', query.year.toString());
			}
			if (query.month !== undefined) {
				params = params.set('month', query.month.toString());
			}
			// Only add date range if year/month not provided
			if (query.year === undefined && query.month === undefined) {
				if (query.startDate) {
					params = params.set('startDate', query.startDate);
				}
				if (query.endDate) {
					params = params.set('endDate', query.endDate);
				}
			}
			if (query.accountCode) {
				params = params.set('accountCode', query.accountCode);
			}
			if (query.search) {
				params = params.set('search', query.search);
			}
			if (query.page !== undefined) {
				params = params.set('page', query.page.toString());
			}
			if (query.limit !== undefined) {
				params = params.set('limit', query.limit.toString());
			}
		}

		return this.http.get<GeneralLedgerResponse>(
			`${this.apiUrl}/reports/general-ledger`,
			{ params }
		);
	}

	/**
	 * Get Profit & Loss statement for a date range or month
	 * @param query Query parameters for filtering
	 * @returns Observable of ProfitLossResponseDto
	 */
	getProfitLoss(query?: ProfitLossQueryDto): Observable<ProfitLossResponseDto> {
		let params = new HttpParams();

		if (query) {
			// Year and month take precedence over startDate/endDate
			if (query.year !== undefined) {
				params = params.set('year', query.year.toString());
			}
			if (query.month !== undefined) {
				params = params.set('month', query.month.toString());
			}
			// Only add date range if year/month not provided
			if (query.year === undefined && query.month === undefined) {
				if (query.startDate) {
					params = params.set('startDate', query.startDate);
				}
				if (query.endDate) {
					params = params.set('endDate', query.endDate);
				}
			}
			if (query.format) {
				params = params.set('format', query.format);
			}
		}

		return this.http.get<ProfitLossResponseDto>(
			`${this.apiUrl}/reports/profit-loss`,
			{ params }
		);
	}

	/**
	 * Get Profit & Loss statement for a specific month
	 * @param year Year (1900-2100)
	 * @param month Month (1-12)
	 * @param format 'summary' or 'detailed' (default: 'detailed')
	 * @returns Observable of ProfitLossResponseDto
	 */
	getProfitLossByMonth(
		year: number,
		month: number,
		format: 'summary' | 'detailed' = 'detailed'
	): Observable<ProfitLossResponseDto> {
		const params = new HttpParams()
			.set('year', year.toString())
			.set('month', month.toString())
			.set('format', format);

		return this.http.get<ProfitLossResponseDto>(
			`${this.apiUrl}/reports/profit-loss/by-month`,
			{ params }
		);
	}

	/**
	 * Expense Recording Methods
	 */

	/**
	 * Create a new expense
	 * @param dto Expense data
	 * @returns Observable of Expense
	 */
	createExpense(dto: CreateExpenseDto): Observable<Expense> {
		return this.http.post<Expense>(`${this.apiUrl}/expenses`, dto);
	}

	/**
	 * Get list of expenses with optional filters
	 * @param query Query parameters for filtering
	 * @returns Observable of Expense array
	 */
	getExpenses(query?: ExpenseQueryDto): Observable<Expense[]> {
		let params = new HttpParams();

		if (query) {
			if (query.startDate) {
				params = params.set('startDate', query.startDate);
			}
			if (query.endDate) {
				params = params.set('endDate', query.endDate);
			}
			if (query.accountCode) {
				params = params.set('accountCode', query.accountCode);
			}
			if (query.category) {
				params = params.set('category', query.category);
			}
			if (query.vendor) {
				params = params.set('vendor', query.vendor);
			}
			if (query.paymentMethod) {
				params = params.set('paymentMethod', query.paymentMethod);
			}
			if (query.isPosted !== undefined) {
				params = params.set('isPosted', query.isPosted.toString());
			}
			if (query.page !== undefined) {
				params = params.set('page', query.page.toString());
			}
			if (query.limit !== undefined) {
				params = params.set('limit', query.limit.toString());
			}
		}

		return this.http.get<Expense[]>(`${this.apiUrl}/expenses`, { params });
	}

	/**
	 * Get a single expense by ID
	 * @param id Expense ID
	 * @returns Observable of Expense
	 */
	getExpense(id: number): Observable<Expense> {
		return this.http.get<Expense>(`${this.apiUrl}/expenses/${id}`);
	}

	/**
	 * Update an expense (only if not posted)
	 * @param id Expense ID
	 * @param dto Updated expense data
	 * @returns Observable of Expense
	 */
	updateExpense(id: number, dto: UpdateExpenseDto): Observable<Expense> {
		return this.http.patch<Expense>(`${this.apiUrl}/expenses/${id}`, dto);
	}

	/**
	 * Delete an expense (only if not posted)
	 * @param id Expense ID
	 * @returns Observable of void
	 */
	deleteExpense(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
	}

	/**
	 * Post an expense to the ledger (creates double-entry transactions)
	 * @param id Expense ID
	 * @returns Observable of Expense
	 */
	postExpenseToLedger(id: number): Observable<Expense> {
		return this.http.post<Expense>(`${this.apiUrl}/expenses/${id}/post`, {});
	}
}

