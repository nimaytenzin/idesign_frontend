import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	EmployeePayscale,
	CreateEmployeePayscaleDto,
	UpdateEmployeePayscaleDto,
} from './employee-payscale.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class EmployeePayscaleService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/employee-payscale`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new employee payscale for a user
	 * @param payscaleData - Employee payscale data
	 * @returns Observable of created employee payscale
	 */
	createEmployeePayscale(
		payscaleData: CreateEmployeePayscaleDto
	): Observable<EmployeePayscale> {
		return this.http.post<EmployeePayscale>(this.apiUrl, payscaleData);
	}

	/**
	 * Get payscale by user ID
	 * @param userId - User ID
	 * @returns Observable of employee payscale with user information
	 */
	getEmployeePayscaleByUserId(userId: number): Observable<EmployeePayscale> {
		return this.http.get<EmployeePayscale>(`${this.apiUrl}/user/${userId}`);
	}

	/**
	 * Update an existing employee payscale for a user
	 * @param userId - User ID
	 * @param payscaleData - Partial employee payscale data to update
	 * @returns Observable of updated employee payscale with user information
	 */
	updateEmployeePayscale(
		userId: number,
		payscaleData: UpdateEmployeePayscaleDto
	): Observable<EmployeePayscale> {
		return this.http.patch<EmployeePayscale>(
			`${this.apiUrl}/user/${userId}`,
			payscaleData
		);
	}
}
