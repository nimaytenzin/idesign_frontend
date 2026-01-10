/**
 * Employee Work Experience Response Interface
 */
export interface EmployeeWorkExperience {
	id: number;
	employeeProfileId: number;
	positionTitle: string;
	effectiveDate: string | Date;
	agency: string;
	place: string;
	endDate: string | Date;
	createdAt: string | Date;
	updatedAt: string | Date;
}

/**
 * Create Employee Work Experience DTO
 */
export interface CreateEmployeeWorkExperienceDto {
	employeeProfileId: number;
	positionTitle: string;
	effectiveDate: string; // ISO 8601 format
	agency: string;
	place: string;
	endDate: string; // ISO 8601 format
}

/**
 * Update Employee Work Experience DTO
 * All fields are optional for partial updates
 */
export interface UpdateEmployeeWorkExperienceDto {
	employeeProfileId?: number;
	positionTitle?: string;
	effectiveDate?: string; // ISO 8601 format
	agency?: string;
	place?: string;
	endDate?: string; // ISO 8601 format
}
