export interface LeaveType {
	id: number;
	name: string;
	code: string;
	daysPerYear: number;
	canCarryForward: boolean;
	maxCarryForwardDays?: number;
	isActive: boolean;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateLeaveTypeDto {
	name: string;
	code: string;
	daysPerYear: number;
	canCarryForward?: boolean;
	maxCarryForwardDays?: number;
	isActive?: boolean;
	description?: string;
}

export interface UpdateLeaveTypeDto {
	name?: string;
	code?: string;
	daysPerYear?: number;
	canCarryForward?: boolean;
	maxCarryForwardDays?: number;
	isActive?: boolean;
	description?: string;
}

