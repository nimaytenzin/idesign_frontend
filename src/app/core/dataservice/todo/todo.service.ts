import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Portfolio,
	Todo,
	CreatePortfolioDto,
	UpdatePortfolioDto,
	CreateTodoDto,
	UpdateTodoDto,
	TodoQueryDto,
	WeeklyViewResponse,
} from './todo.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class TodoService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/todos`;

	constructor(private http: HttpClient) {}

	/**
	 * Portfolio Management Methods
	 */

	/**
	 * Create a new portfolio
	 * @param dto Portfolio data
	 * @returns Observable of Portfolio
	 */
	createPortfolio(dto: CreatePortfolioDto): Observable<Portfolio> {
		return this.http.post<Portfolio>(`${this.apiUrl}/portfolios`, dto);
	}

	/**
	 * Get all portfolios with their associated todos count
	 * @returns Observable of Portfolio array
	 */
	getAllPortfolios(): Observable<Portfolio[]> {
		return this.http.get<Portfolio[]>(`${this.apiUrl}/portfolios`);
	}

	/**
	 * Get a specific portfolio by ID
	 * @param id Portfolio ID
	 * @returns Observable of Portfolio
	 */
	getPortfolioById(id: number): Observable<Portfolio> {
		return this.http.get<Portfolio>(`${this.apiUrl}/portfolios/${id}`);
	}

	/**
	 * Update an existing portfolio
	 * @param id Portfolio ID
	 * @param dto Updated portfolio data
	 * @returns Observable of Portfolio
	 */
	updatePortfolio(id: number, dto: UpdatePortfolioDto): Observable<Portfolio> {
		return this.http.patch<Portfolio>(`${this.apiUrl}/portfolios/${id}`, dto);
	}

	/**
	 * Delete a portfolio
	 * Note: This will not delete associated todos, but todos will lose their portfolio association
	 * @param id Portfolio ID
	 * @returns Observable of void
	 */
	deletePortfolio(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/portfolios/${id}`);
	}

	/**
	 * Todo Management Methods
	 */

	/**
	 * Create a new todo task
	 * @param dto Todo data
	 * @returns Observable of Todo
	 */
	createTodo(dto: CreateTodoDto): Observable<Todo> {
		return this.http.post<Todo>(`${this.apiUrl}`, dto);
	}

	/**
	 * Get all todos with optional filtering
	 * @param query Query parameters for filtering
	 * @returns Observable of Todo array
	 */
	getAllTodos(query?: TodoQueryDto): Observable<Todo[]> {
		let params = new HttpParams();

		if (query) {
			if (query.portfolioId !== undefined) {
				params = params.set('portfolioId', query.portfolioId.toString());
			}
			if (query.status) {
				params = params.set('status', query.status);
			}
			if (query.assignedUserId !== undefined) {
				params = params.set('assignedUserId', query.assignedUserId.toString());
			}
			if (query.startDate) {
				params = params.set('startDate', query.startDate);
			}
			if (query.endDate) {
				params = params.set('endDate', query.endDate);
			}
		}

		return this.http.get<Todo[]>(`${this.apiUrl}`, { params });
	}

	/**
	 * Get a specific todo by ID
	 * @param id Todo ID
	 * @returns Observable of Todo
	 */
	getTodoById(id: number): Observable<Todo> {
		return this.http.get<Todo>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update an existing todo
	 * @param id Todo ID
	 * @param dto Updated todo data
	 * @returns Observable of Todo
	 */
	updateTodo(id: number, dto: UpdateTodoDto): Observable<Todo> {
		return this.http.patch<Todo>(`${this.apiUrl}/${id}`, dto);
	}

	/**
	 * Delete a todo
	 * @param id Todo ID
	 * @returns Observable of void
	 */
	deleteTodo(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Calendar View Methods
	 */

	/**
	 * Get all todos for a specific day
	 * Returns todos where the assigned date or due date falls on the specified day
	 * @param date Date to view (format: YYYY-MM-DD)
	 * @returns Observable of Todo array
	 */
	getDailyView(date: string): Observable<Todo[]> {
		return this.http.get<Todo[]>(`${this.apiUrl}/day/${date}`);
	}

	/**
	 * Get all todos for a week starting from the specified date, grouped by day of the week
	 * @param startDate Start date of the week (format: YYYY-MM-DD)
	 * @returns Observable of WeeklyViewResponse
	 */
	getWeeklyView(startDate: string): Observable<WeeklyViewResponse> {
		return this.http.get<WeeklyViewResponse>(`${this.apiUrl}/week/${startDate}`);
	}
}

