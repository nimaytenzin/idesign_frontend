import { EmployeeStatus } from '../../../constants/enums';

/**
 * Employee Profile Response Interface
 */
export interface EmployeeProfile {
	id: number;
	userId: number;
	department: string;
	position: string;
	hireDate: string | Date;
	terminationDate: string | Date;
	employeeStatus: EmployeeStatus;
	bio:string;
	createdAt: string | Date;
	updatedAt: string | Date;
}

/**
 * Create Employee Profile DTO
 */
export interface CreateEmployeeProfileDto {
	userId: number;
	department: string;
	position: string;
	hireDate: Date;  
	bio:string;
	employeeStatus: EmployeeStatus;
}

/**
 * Update Employee Profile DTO
 * All fields are optional for partial updates
 */
export interface UpdateEmployeeProfileDto {
	userId?: number;
	department?: string;
	position?: string;
	bio?: string;
	hireDate?: Date; // ISO 8601 format
	terminationDate?: Date | null; // ISO 8601 format
	employeeStatus?: EmployeeStatus;
}

