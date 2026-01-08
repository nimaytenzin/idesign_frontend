import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	StaffMember,
	CreateStaffMemberDto,
	UpdateStaffMemberDto,
	ResetPasswordDto,
	ResetPasswordResponse,
	EmployeeEducation,
	CreateEducationDto,
	UpdateEducationDto,
	EmployeeWorkExperience,
	CreateWorkExperienceDto,
	UpdateWorkExperienceDto,
	DeleteResponse,
} from './employee-management.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class EmployeeManagementService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/employee-management`;

	constructor(private http: HttpClient) {}

	// Create new staff member
	createStaffMember(staffData: CreateStaffMemberDto): Observable<StaffMember> {
		return this.http.post<StaffMember>(`${this.apiUrl}/staff`, staffData);
	}

	// Get all staff members
	getAllStaffMembers(): Observable<StaffMember[]> {
		return this.http.get<StaffMember[]>(`${this.apiUrl}/staff`);
	}

	// Get staff member by ID
	getStaffMemberById(id: number): Observable<StaffMember> {
		return this.http.get<StaffMember>(`${this.apiUrl}/staff/${id}`);
	}

	// Update staff member
	updateStaffMember(
		id: number,
		staffData: UpdateStaffMemberDto
	): Observable<StaffMember> {
		return this.http.patch<StaffMember>(
			`${this.apiUrl}/staff/${id}`,
			staffData
		);
	}

	// Reset staff password
	resetStaffPassword(
		id: number,
		passwordData: ResetPasswordDto
	): Observable<ResetPasswordResponse> {
		return this.http.post<ResetPasswordResponse>(
			`${this.apiUrl}/staff/${id}/reset-password`,
			passwordData
		);
	}

	// Delete staff member
	deleteStaffMember(id: number): Observable<DeleteResponse> {
		return this.http.delete<DeleteResponse>(
			`${this.apiUrl}/staff/${id}`
		);
	}

	// Education Management
	// Get all education qualifications for a staff member
	getStaffEducation(id: number): Observable<EmployeeEducation[]> {
		return this.http.get<EmployeeEducation[]>(
			`${this.apiUrl}/staff/${id}/education`
		);
	}

	// Add education qualification
	addEducation(
		id: number,
		educationData: CreateEducationDto
	): Observable<EmployeeEducation> {
		return this.http.post<EmployeeEducation>(
			`${this.apiUrl}/staff/${id}/education`,
			educationData
		);
	}

	// Update education qualification
	updateEducation(
		id: number,
		educationId: number,
		educationData: UpdateEducationDto
	): Observable<EmployeeEducation> {
		return this.http.patch<EmployeeEducation>(
			`${this.apiUrl}/staff/${id}/education/${educationId}`,
			educationData
		);
	}

	// Delete education qualification
	deleteEducation(
		id: number,
		educationId: number
	): Observable<DeleteResponse> {
		return this.http.delete<DeleteResponse>(
			`${this.apiUrl}/staff/${id}/education/${educationId}`
		);
	}

	// Work Experience Management
	// Get all work experience for a staff member
	getStaffWorkExperience(id: number): Observable<EmployeeWorkExperience[]> {
		return this.http.get<EmployeeWorkExperience[]>(
			`${this.apiUrl}/staff/${id}/work-experience`
		);
	}

	// Add work experience
	addWorkExperience(
		id: number,
		workExperienceData: CreateWorkExperienceDto
	): Observable<EmployeeWorkExperience> {
		return this.http.post<EmployeeWorkExperience>(
			`${this.apiUrl}/staff/${id}/work-experience`,
			workExperienceData
		);
	}

	// Update work experience
	updateWorkExperience(
		id: number,
		experienceId: number,
		workExperienceData: UpdateWorkExperienceDto
	): Observable<EmployeeWorkExperience> {
		return this.http.patch<EmployeeWorkExperience>(
			`${this.apiUrl}/staff/${id}/work-experience/${experienceId}`,
			workExperienceData
		);
	}

	// Delete work experience
	deleteWorkExperience(
		id: number,
		experienceId: number
	): Observable<DeleteResponse> {
		return this.http.delete<DeleteResponse>(
			`${this.apiUrl}/staff/${id}/work-experience/${experienceId}`
		);
	}

	// Upload profile picture
	uploadProfilePicture(id: number, file: File): Observable<StaffMember> {
		const formData = new FormData();
		formData.append('profilePicture', file);
		return this.http.post<StaffMember>(
			`${this.apiUrl}/staff/${id}/profile-picture`,
			formData
		);
	}
}

