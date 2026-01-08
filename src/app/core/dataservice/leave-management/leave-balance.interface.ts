import { LeaveType } from './leave-type.interface';
import { User } from '../auth/auth.interface';

export interface LeaveBalance {
	id: number;
	userId: number;
	leaveTypeId: number;
	year: number;
	allocatedDays: number;
	usedDays: number;
	carriedForwardDays: number;
	availableDays: number; // Calculated: allocatedDays + carriedForwardDays - usedDays
	createdAt?: Date;
	updatedAt?: Date;
	// Populated relations
	user?: User;
	leaveType?: LeaveType;
}

export interface LeaveBalanceQueryDto {
	userId?: number;
	leaveTypeId?: number;
	year?: number;
}

