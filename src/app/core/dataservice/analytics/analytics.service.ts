import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	VisitorStats,
	CountryStats,
	DeviceStats,
	ReferrerStats,
	DistrictStats,
	VisitorsResponse,
	AnalyticsQueryParams,
	TrackVisitorDto,
} from './analytics.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AnalyticsService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/analytics`;

	constructor(private http: HttpClient) {}

	/**
	 * Manually track a visitor (optional - automatic tracking is enabled via interceptor)
	 */
	trackVisitor(trackData: TrackVisitorDto): Observable<{ message: string }> {
		return this.http.post<{ message: string }>(`${this.apiUrl}/track`, trackData);
	}

	/**
	 * Get comprehensive visitor statistics with optional filters
	 */
	getVisitorStats(params?: AnalyticsQueryParams): Observable<VisitorStats> {
		let httpParams = new HttpParams();
		if (params) {
			if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
			if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
			if (params.country) httpParams = httpParams.set('country', params.country);
			if (params.district) httpParams = httpParams.set('district', params.district);
			if (params.deviceType) httpParams = httpParams.set('deviceType', params.deviceType);
			if (params.referrerSource) httpParams = httpParams.set('referrerSource', params.referrerSource);
		}
		return this.http.get<VisitorStats>(`${this.apiUrl}/stats`, { params: httpParams });
	}

	/**
	 * Get visitor count grouped by country
	 */
	getVisitorsByCountry(params?: AnalyticsQueryParams): Observable<CountryStats[]> {
		let httpParams = new HttpParams();
		if (params) {
			if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
			if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
			if (params.country) httpParams = httpParams.set('country', params.country);
			if (params.district) httpParams = httpParams.set('district', params.district);
			if (params.deviceType) httpParams = httpParams.set('deviceType', params.deviceType);
			if (params.referrerSource) httpParams = httpParams.set('referrerSource', params.referrerSource);
		}
		return this.http.get<CountryStats[]>(`${this.apiUrl}/visitors/by-country`, { params: httpParams });
	}

	/**
	 * Get visitor count grouped by device type
	 */
	getVisitorsByDevice(params?: AnalyticsQueryParams): Observable<DeviceStats[]> {
		let httpParams = new HttpParams();
		if (params) {
			if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
			if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
			if (params.country) httpParams = httpParams.set('country', params.country);
			if (params.district) httpParams = httpParams.set('district', params.district);
			if (params.deviceType) httpParams = httpParams.set('deviceType', params.deviceType);
			if (params.referrerSource) httpParams = httpParams.set('referrerSource', params.referrerSource);
		}
		return this.http.get<DeviceStats[]>(`${this.apiUrl}/visitors/by-device`, { params: httpParams });
	}

	/**
	 * Get visitor count grouped by referrer source
	 */
	getVisitorsByReferrer(params?: AnalyticsQueryParams): Observable<ReferrerStats[]> {
		let httpParams = new HttpParams();
		if (params) {
			if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
			if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
			if (params.country) httpParams = httpParams.set('country', params.country);
			if (params.district) httpParams = httpParams.set('district', params.district);
			if (params.deviceType) httpParams = httpParams.set('deviceType', params.deviceType);
			if (params.referrerSource) httpParams = httpParams.set('referrerSource', params.referrerSource);
		}
		return this.http.get<ReferrerStats[]>(`${this.apiUrl}/visitors/by-referrer`, { params: httpParams });
	}

	/**
	 * Get visitor count grouped by district within countries
	 */
	getVisitorsByDistrict(country?: string, params?: AnalyticsQueryParams): Observable<DistrictStats[]> {
		let httpParams = new HttpParams();
		if (country) {
			httpParams = httpParams.set('country', country);
		}
		if (params) {
			if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
			if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
			if (params.district) httpParams = httpParams.set('district', params.district);
			if (params.deviceType) httpParams = httpParams.set('deviceType', params.deviceType);
			if (params.referrerSource) httpParams = httpParams.set('referrerSource', params.referrerSource);
		}
		return this.http.get<DistrictStats[]>(`${this.apiUrl}/visitors/by-district`, { params: httpParams });
	}

	/**
	 * Get paginated list of individual visitor records
	 */
	getVisitors(params?: AnalyticsQueryParams): Observable<VisitorsResponse> {
		let httpParams = new HttpParams();
		if (params) {
			if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
			if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
			if (params.country) httpParams = httpParams.set('country', params.country);
			if (params.district) httpParams = httpParams.set('district', params.district);
			if (params.deviceType) httpParams = httpParams.set('deviceType', params.deviceType);
			if (params.referrerSource) httpParams = httpParams.set('referrerSource', params.referrerSource);
			if (params.page) httpParams = httpParams.set('page', params.page.toString());
			if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
		}
		return this.http.get<VisitorsResponse>(`${this.apiUrl}/visitors`, { params: httpParams });
	}
}



