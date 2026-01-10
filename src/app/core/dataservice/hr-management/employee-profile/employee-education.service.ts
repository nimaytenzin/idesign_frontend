import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	EmployeeEducation,
	CreateEmployeeEducationDto,
	UpdateEmployeeEducationDto,
} from './employee.education.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class EmployeeEducationService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/employee-education`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new education record for an employee
	 * @param userId - User ID (must have an existing employee profile)
	 * @param educationData - Education data
	 * @returns Observable of created education record
	 */
	createEmployeeEducation(
		userId: number,
		educationData: CreateEmployeeEducationDto
	): Observable<EmployeeEducation> {
		return this.http.post<EmployeeEducation>(
			`${this.apiUrl}/${userId}`,
			educationData
		);
	}

	/**
	 * Get all education records for an employee profile
	 * @param userId - User ID (must have an employee profile)
	 * @returns Observable of array of education records
	 */
	getAllEmployeeEducations(
		userId: number
	): Observable<EmployeeEducation[]> {
		return this.http.get<EmployeeEducation[]>(`${this.apiUrl}/${userId}`);
	}

	/**
	 * Update an existing education record
	 * @param userId - User ID (must have an employee profile)
	 * @param id - Education record ID to update
	 * @param educationData - Partial education data to update
	 * @returns Observable of updated education record
	 */
	updateEmployeeEducation(
		userId: number,
		id: number,
		educationData: UpdateEmployeeEducationDto
	): Observable<EmployeeEducation> {
		return this.http.patch<EmployeeEducation>(
			`${this.apiUrl}/${userId}/${id}`,
			educationData
		);
	}

	/**
	 * Delete an education record
	 * @param userId - User ID (must have an employee profile)
	 * @param id - Education record ID to delete
	 * @returns Observable of delete response
	 */
	deleteEmployeeEducation(
		userId: number,
		id: number
	): Observable<{ message: string }> {
		return this.http.delete<{ message: string }>(
			`${this.apiUrl}/${userId}/${id}`
		);
	}
}
