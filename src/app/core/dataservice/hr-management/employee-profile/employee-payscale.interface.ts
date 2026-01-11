import { User } from '../../user/user.interface';

/**
 * Employee Payscale Response Interface
 */
export interface EmployeePayscale {
	id: string; // UUID
	userId: number;
	basicSalary: number;
	benefitsAllowance: number;
	salaryArrear: number;
	grossSalary: number;
	pfDeduction: number;
	gisDeduction: number;
	netSalary: number;
	tds: number;
	healthContribution: number;
	totalPayout: number;
	updatedAt: string | Date;
	user?: {
		id: number;
		name: string;
		emailAddress: string;
	};
}

/**
 * Create Employee Payscale DTO
 */
export interface CreateEmployeePayscaleDto {
	userId: number;
	basicSalary: number;
	benefitsAllowance: number;
	salaryArrear?: number;
	grossSalary: number;
	pfDeduction: number;
	gisDeduction: number;
	netSalary: number;
	tds: number;
	healthContribution: number;
	totalPayout: number;
}

/**
 * Update Employee Payscale DTO
 * All fields are optional for partial updates
 */
export interface UpdateEmployeePayscaleDto {
	userId?: number;
	basicSalary?: number;
	benefitsAllowance?: number;
	salaryArrear?: number;
	grossSalary?: number;
	pfDeduction?: number;
	gisDeduction?: number;
	netSalary?: number;
	tds?: number;
	healthContribution?: number;
	totalPayout?: number;
}
