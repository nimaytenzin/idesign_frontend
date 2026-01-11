import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	EmployeeProfile,
	CreateEmployeeProfileDto,
	UpdateEmployeeProfileDto,
} from './employee.profile.interface';
import { environment } from '../../../../../environments/environment';
import { User } from '../../user/user.interface';

@Injectable({
	providedIn: 'root',
})
export class EmployeeProfileService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/employee-profile`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new employee profile for a user
	 * @param profileData - Employee profile data
	 * @returns Observable of created employee profile
	 */
	createEmployeeProfile(
		profileData: CreateEmployeeProfileDto
	): Observable<EmployeeProfile> {
		return this.http.post<EmployeeProfile>(this.apiUrl, profileData);
	}

	/**
	 * Update an existing employee profile
	 * @param id - Employee profile ID
	 * @param profileData - Partial employee profile data to update
	 * @returns Observable of updated employee profile
	 */
	updateEmployeeProfile(
		id: number,
		profileData: UpdateEmployeeProfileDto
	): Observable<EmployeeProfile> {
		return this.http.patch<EmployeeProfile>(
			`${this.apiUrl}/${id}`,
			profileData
		);
	}

	/**
	 * Get all staff for public page display
	 * @returns Observable of public staff list containing name, department, position, and bio
	 */
	getPublicStaffList(): Observable<User[]> {
		return this.http.get<User[]>(`${this.apiUrl}/public/staff`);
	}

	/**
	 * Get employee profile for the authenticated staff user (convenience route)
	 * Access: STAFF only
	 * Uses authenticated user's ID from JWT token
	 * @returns Observable of User with employee profile
	 */
	getMyEmployeeProfile(): Observable<User> {
		return this.http.get<User>(`${this.apiUrl}/me`);
	}

	/**
	 * Get employee profile by user ID
	 * Access: ADMIN and STAFF
	 * ADMIN can view any employee profile
	 * STAFF can only view their own profile (validated on backend)
	 * @param userId - User ID
	 * @returns Observable of User with employee profile
	 */
	getEmployeeProfileByUserId(userId: number): Observable<User> {
		return this.http.get<User>(`${this.apiUrl}/user/${userId}`);
	}

	/**
	 * Get just the employee profile for the authenticated staff user
	 * Access: STAFF only
	 * Uses authenticated user's ID from JWT token
	 * @returns Observable of EmployeeProfile (extracted from User response)
	 */
	getMyEmployeeProfileOnly(): Observable<EmployeeProfile | null> {
		return this.http.get<User>(`${this.apiUrl}/me`).pipe(
			map((user: User) => user.employeeProfile || null)
		);
	}

	/**
	 * Get employee profile by user ID (returns just EmployeeProfile)
	 * Access: ADMIN and STAFF
	 * ADMIN can view any employee profile
	 * STAFF can only view their own profile (validated on backend)
	 * @param userId - User ID
	 * @returns Observable of EmployeeProfile (extracted from User response)
	 */
	getEmployeeProfileOnlyByUserId(userId: number): Observable<EmployeeProfile | null> {
		return this.http.get<User>(`${this.apiUrl}/user/${userId}`).pipe(
			map((user: User) => user.employeeProfile || null)
		);
	}
}
