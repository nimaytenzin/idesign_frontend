import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	EmployeeWorkExperience,
	CreateEmployeeWorkExperienceDto,
	UpdateEmployeeWorkExperienceDto,
} from './employee.work-experience.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class EmployeeWorkExperienceService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/employee-work-experience`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new work experience record for an employee
	 * @param userId - User ID (must have an existing employee profile)
	 * @param workExperienceData - Work experience data
	 * @returns Observable of created work experience record
	 */
	createEmployeeWorkExperience(
		userId: number,
		workExperienceData: CreateEmployeeWorkExperienceDto
	): Observable<EmployeeWorkExperience> {
		return this.http.post<EmployeeWorkExperience>(
			`${this.apiUrl}/${userId}`,
			workExperienceData
		);
	}

	/**
	 * Get all work experience records for an employee profile
	 * @param userId - User ID (must have an employee profile)
	 * @returns Observable of array of work experience records
	 */
	getAllEmployeeWorkExperiences(
		userId: number
	): Observable<EmployeeWorkExperience[]> {
		return this.http.get<EmployeeWorkExperience[]>(
			`${this.apiUrl}/${userId}`
		);
	}

	/**
	 * Update an existing work experience record
	 * @param userId - User ID (must have an employee profile)
	 * @param id - Work experience record ID to update
	 * @param workExperienceData - Partial work experience data to update
	 * @returns Observable of updated work experience record
	 */
	updateEmployeeWorkExperience(
		userId: number,
		id: number,
		workExperienceData: UpdateEmployeeWorkExperienceDto
	): Observable<EmployeeWorkExperience> {
		return this.http.patch<EmployeeWorkExperience>(
			`${this.apiUrl}/${userId}/${id}`,
			workExperienceData
		);
	}

	/**
	 * Delete a work experience record
	 * @param userId - User ID (must have an employee profile)
	 * @param id - Work experience record ID to delete
	 * @returns Observable of delete response
	 */
	deleteEmployeeWorkExperience(
		userId: number,
		id: number
	): Observable<{ message: string }> {
		return this.http.delete<{ message: string }>(
			`${this.apiUrl}/${userId}/${id}`
		);
	}
}
