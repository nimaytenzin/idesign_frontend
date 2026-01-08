import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	LeaveBalance,
	LeaveBalanceQueryDto,
} from './leave-balance.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class LeaveBalanceService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/leave-balances`;

	constructor(private http: HttpClient) {}

	/**
	 * Get all leave balances with optional filters
	 */
	getAllLeaveBalances(
		query?: LeaveBalanceQueryDto
	): Observable<LeaveBalance[]> {
		let params = new HttpParams();

		if (query) {
			if (query.userId)
				params = params.set('userId', query.userId.toString());
			if (query.leaveTypeId)
				params = params.set(
					'leaveTypeId',
					query.leaveTypeId.toString()
				);
			if (query.year)
				params = params.set('year', query.year.toString());
		}

		return this.http.get<LeaveBalance[]>(this.apiUrl, { params });
	}

	/**
	 * Get leave balances for a specific user
	 */
	getLeaveBalancesByUser(
		userId: number,
		year?: number
	): Observable<LeaveBalance[]> {
		if (year) {
			return this.http.get<LeaveBalance[]>(
				`${this.apiUrl}/user/${userId}/year/${year}`
			);
		}
		return this.http.get<LeaveBalance[]>(
			`${this.apiUrl}/user/${userId}`
		);
	}

	/**
	 * Get leave balance for a specific user, leave type, and year
	 */
	getLeaveBalance(
		userId: number,
		leaveTypeId: number,
		year: number
	): Observable<LeaveBalance | null> {
		const params = new HttpParams()
			.set('userId', userId.toString())
			.set('leaveTypeId', leaveTypeId.toString())
			.set('year', year.toString());

		return this.http
			.get<LeaveBalance[]>(this.apiUrl, { params })
			.pipe(map((balances: LeaveBalance[]) => balances[0] || null));
	}

	/**
	 * Get current year balances for a user
	 */
	getCurrentYearLeaveBalances(userId: number): Observable<LeaveBalance[]> {
		const currentYear = new Date().getFullYear();
		return this.getLeaveBalancesByUser(userId, currentYear);
	}

	/**
	 * Initialize leave balances for a year (Admin only)
	 */
	initializeYearLeaveBalances(
		year: number
	): Observable<{ message: string }> {
		return this.http.post<{ message: string }>(
			`${this.apiUrl}/initialize/${year}`,
			{}
		);
	}
}

