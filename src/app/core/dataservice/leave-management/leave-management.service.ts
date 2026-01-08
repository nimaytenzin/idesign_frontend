import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { LeaveTypeService } from './leave-type.service';
import { LeaveRequestService } from './leave-request.service';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveType } from './leave-type.interface';
import { LeaveRequest } from './leave-request.interface';
import { LeaveBalance } from './leave-balance.interface';
import { LeaveRequestStatus } from './leave-management.enums';

@Injectable({
	providedIn: 'root',
})
export class LeaveManagementService {
	constructor(
		private leaveTypeService: LeaveTypeService,
		private leaveRequestService: LeaveRequestService,
		private leaveBalanceService: LeaveBalanceService
	) {}

	/**
	 * Get dashboard data for employee
	 */
	getEmployeeDashboard(userId: number): Observable<{
		balances: LeaveBalance[];
		pendingRequests: LeaveRequest[];
		recentRequests: LeaveRequest[];
		leaveTypes: LeaveType[];
	}> {
		return forkJoin({
			balances:
				this.leaveBalanceService.getCurrentYearLeaveBalances(userId),
			pendingRequests: this.leaveRequestService.getAllLeaveRequests({
				userId,
				status: LeaveRequestStatus.PENDING,
			}),
			recentRequests:
				this.leaveRequestService.getCurrentYearLeaveRequests(userId),
			leaveTypes: this.leaveTypeService.getActiveLeaveTypes(),
		});
	}

	/**
	 * Get dashboard data for admin
	 */
	getAdminDashboard(): Observable<{
		pendingRequests: LeaveRequest[];
		leaveTypes: LeaveType[];
	}> {
		return forkJoin({
			pendingRequests:
				this.leaveRequestService.getPendingLeaveRequests(),
			leaveTypes: this.leaveTypeService.getAllLeaveTypes(),
		});
	}
}

