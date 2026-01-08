import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	AffiliateMarketer,
	CreateAffiliateMarketerDto,
	UpdateAffiliateMarketerDto,
	ResetAffiliatePasswordDto,
	ResetAffiliatePasswordResponse,
	AffiliateCommissionResponse,
	AffiliateStatsResponse,
	MonthlyReportQuery,
	MonthlyReportResponse,
} from './affiliate-marketer.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AffiliateMarketerService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/affiliate-marketer`;

	constructor(private http: HttpClient) {}

	// Admin endpoints - Manage affiliate marketers

	/**
	 * Create a new affiliate marketer
	 * Requires ADMIN role
	 */
	createAffiliateMarketer(
		affiliateData: CreateAffiliateMarketerDto
	): Observable<AffiliateMarketer> {
		return this.http.post<AffiliateMarketer>(
			`${this.apiUrl}`,
			affiliateData
		);
	}

	/**
	 * Get all affiliate marketers
	 * Requires ADMIN role
	 */
	getAllAffiliateMarketers(): Observable<AffiliateMarketer[]> {
		return this.http.get<AffiliateMarketer[]>(`${this.apiUrl}`);
	}

	/**
	 * Get affiliate marketer by ID
	 * Requires ADMIN role
	 */
	getAffiliateMarketerById(id: number): Observable<AffiliateMarketer> {
		return this.http.get<AffiliateMarketer>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update affiliate marketer
	 * Requires ADMIN role
	 */
	updateAffiliateMarketer(
		id: number,
		affiliateData: UpdateAffiliateMarketerDto
	): Observable<AffiliateMarketer> {
		return this.http.patch<AffiliateMarketer>(
			`${this.apiUrl}/${id}`,
			affiliateData
		);
	}

	/**
	 * Delete affiliate marketer
	 * Requires ADMIN role
	 */
	deleteAffiliateMarketer(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Reset affiliate marketer password
	 * Requires ADMIN role
	 */
	resetAffiliatePassword(
		id: number,
		passwordData: ResetAffiliatePasswordDto
	): Observable<ResetAffiliatePasswordResponse> {
		return this.http.post<ResetAffiliatePasswordResponse>(
			`${this.apiUrl}/${id}/reset-password`,
			passwordData
		);
	}

	// Affiliate-facing endpoints (read-only for affiliates)

	/**
	 * Get total commission earned, total orders, and total amount sold
	 * Requires AFFILIATE_MARKETER role
	 */
	getTotalCommission(): Observable<AffiliateCommissionResponse> {
		return this.http.get<AffiliateCommissionResponse>(
			`${environment.BASEAPI_URL}/affiliate/commission`
		);
	}

	/**
	 * Get comprehensive statistics including products sold
	 * Requires AFFILIATE_MARKETER role
	 */
	getStats(): Observable<AffiliateStatsResponse> {
		return this.http.get<AffiliateStatsResponse>(
			`${environment.BASEAPI_URL}/affiliate/stats`
		);
	}

	/**
	 * Get monthly commission and sales report
	 * Requires AFFILIATE_MARKETER role
	 * @param month Optional month (1-12), defaults to current month
	 * @param year Optional year, defaults to current year
	 */
	getMonthlyReport(
		month?: number,
		year?: number
	): Observable<MonthlyReportResponse> {
		let params = new HttpParams();
		if (month !== undefined) {
			params = params.set('month', month.toString());
		}
		if (year !== undefined) {
			params = params.set('year', year.toString());
		}
		return this.http.get<MonthlyReportResponse>(
			`${environment.BASEAPI_URL}/affiliate/reports/monthly`,
			{ params }
		);
	}
}

