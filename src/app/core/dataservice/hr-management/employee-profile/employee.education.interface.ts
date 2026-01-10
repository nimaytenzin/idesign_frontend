import {
	EmployeeEducationLevel,
	EmployeeEducationStatus,
} from '../../../constants/enums';

/**
 * Employee Education Response Interface
 */
export interface EmployeeEducation {
	id: number;
	employeeProfileId: number;
	level: EmployeeEducationLevel;
	courseTitle: string;
	institute: string;
	startDate: string | Date;
	endDate: string | Date;
	status: EmployeeEducationStatus;
	createdAt: string | Date;
	updatedAt: string | Date;
}

/**
 * Create Employee Education DTO
 */
export interface CreateEmployeeEducationDto {
	employeeProfileId: number;
	level: EmployeeEducationLevel;
	courseTitle: string;
	institute: string;
	startDate: string; // ISO 8601 format
	endDate: string; // ISO 8601 format
	status: EmployeeEducationStatus;
}

/**
 * Update Employee Education DTO
 * All fields are optional for partial updates
 */
export interface UpdateEmployeeEducationDto {
	employeeProfileId?: number;
	level?: EmployeeEducationLevel;
	courseTitle?: string;
	institute?: string;
	startDate?: string; // ISO 8601 format
	endDate?: string; // ISO 8601 format
	status?: EmployeeEducationStatus;
}
