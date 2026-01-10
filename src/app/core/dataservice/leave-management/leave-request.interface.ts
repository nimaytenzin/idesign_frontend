import { LeaveRequestStatus } from './leave-management.enums';
import { LeaveType } from './leave-type.interface';
import { User } from '../user/user.interface';
export interface LeaveRequest {
	id: number;
	userId: number;
	leaveTypeId: number;
	startDate: string;
	endDate: string;
	numberOfDays: number;
	reason: string;
	status: LeaveRequestStatus;
	approvedBy?: number;
	approvedAt?: string;
	rejectionReason?: string;
	appliedAt: string;
	createdAt?: Date;
	updatedAt?: Date;
	// Populated relations
	user?: User;
	approver?: User;
	leaveType?: LeaveType;
}

export interface CreateLeaveRequestDto {
	leaveTypeId: number;
	startDate: string; // ISO date string
	endDate: string; // ISO date string
	reason: string;
}

export interface ApproveLeaveRequestDto {
	// No body needed, just the request ID
}

export interface RejectLeaveRequestDto {
	rejectionReason?: string;
}

export interface LeaveRequestQueryDto {
	userId?: number;
	leaveTypeId?: number;
	status?: LeaveRequestStatus;
	year?: number;
	month?: number;
}

