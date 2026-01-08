import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	LeaveType,
	CreateLeaveTypeDto,
	UpdateLeaveTypeDto,
} from './leave-type.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class LeaveTypeService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/leave-types`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new leave type (Admin only)
	 */
	createLeaveType(
		createLeaveTypeDto: CreateLeaveTypeDto
	): Observable<LeaveType> {
		return this.http.post<LeaveType>(this.apiUrl, createLeaveTypeDto);
	}

	/**
	 * Get all leave types
	 */
	getAllLeaveTypes(): Observable<LeaveType[]> {
		return this.http.get<LeaveType[]>(this.apiUrl);
	}

	/**
	 * Get active leave types only
	 */
	getActiveLeaveTypes(): Observable<LeaveType[]> {
		return this.http.get<LeaveType[]>(this.apiUrl).pipe(
			map((types) => types.filter((type) => type.isActive))
		);
	}

	/**
	 * Get a single leave type by ID
	 */
	getLeaveTypeById(id: number): Observable<LeaveType> {
		return this.http.get<LeaveType>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update a leave type (Admin only)
	 */
	updateLeaveType(
		id: number,
		updateLeaveTypeDto: UpdateLeaveTypeDto
	): Observable<LeaveType> {
		return this.http.patch<LeaveType>(
			`${this.apiUrl}/${id}`,
			updateLeaveTypeDto
		);
	}

	/**
	 * Delete a leave type (Admin only)
	 */
	deleteLeaveType(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}

