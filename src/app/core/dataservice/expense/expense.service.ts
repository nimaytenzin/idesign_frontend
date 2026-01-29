import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Expense,
	CreateExpenseDto,
	UpdateExpenseDto,
	ExpenseQueryDto,
	ExpenseByMonthQueryDto,
	ExpenseMonthlyReportResponseDto,
	ExpenseDailyStatsResponseDto,
} from './expense.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ExpenseService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/expenses`;

	constructor(private http: HttpClient) {}

	create(dto: CreateExpenseDto): Observable<Expense> {
		return this.http.post<Expense>(this.apiUrl, dto);
	}

	getAll(query?: ExpenseQueryDto): Observable<Expense[]> {
		let params = new HttpParams();
		if (query?.startDate) params = params.set('startDate', query.startDate);
		if (query?.endDate) params = params.set('endDate', query.endDate);
		return this.http.get<Expense[]>(this.apiUrl, { params });
	}

	getByMonth(query: ExpenseByMonthQueryDto): Observable<Expense[]> {
		const params = new HttpParams()
			.set('year', query.year.toString())
			.set('month', query.month.toString());
		return this.http.get<Expense[]>(`${this.apiUrl}/by-month`, { params });
	}

	/** GET /expenses/monthly-report – expenses aggregated by type and subtype */
	getMonthlyReport(query: ExpenseByMonthQueryDto): Observable<ExpenseMonthlyReportResponseDto> {
		const params = new HttpParams()
			.set('year', query.year.toString())
			.set('month', query.month.toString());
		return this.http.get<ExpenseMonthlyReportResponseDto>(`${this.apiUrl}/monthly-report`, { params });
	}

	/** GET /expenses/daily-stats – date (YYYY-MM-DD) required */
	getExpenseDailyStats(date: string): Observable<ExpenseDailyStatsResponseDto> {
		const params = new HttpParams().set('date', date);
		return this.http.get<ExpenseDailyStatsResponseDto>(`${this.apiUrl}/daily-stats`, { params });
	}

	getById(id: number): Observable<Expense> {
		return this.http.get<Expense>(`${this.apiUrl}/${id}`);
	}

	update(id: number, dto: UpdateExpenseDto): Observable<Expense> {
		return this.http.patch<Expense>(`${this.apiUrl}/${id}`, dto);
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
