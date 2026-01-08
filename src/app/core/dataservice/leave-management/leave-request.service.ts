import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequestStatus } from './leave-management.enums';
import {
	LeaveRequest,
	CreateLeaveRequestDto,
	RejectLeaveRequestDto,
	LeaveRequestQueryDto,
} from './leave-request.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class LeaveRequestService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/leave-requests`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new leave request
	 */
	createLeaveRequest(
		createLeaveRequestDto: CreateLeaveRequestDto
	): Observable<LeaveRequest> {
		return this.http.post<LeaveRequest>(
			this.apiUrl,
			createLeaveRequestDto
		);
	}

	/**
	 * Get all leave requests with optional filters
	 * Employees see only their own, admins see all
	 */
	getAllLeaveRequests(
		query?: LeaveRequestQueryDto
	): Observable<LeaveRequest[]> {
		let params = new HttpParams();

		if (query) {
			if (query.userId)
				params = params.set('userId', query.userId.toString());
			if (query.leaveTypeId)
				params = params.set('leaveTypeId', query.leaveTypeId.toString());
			if (query.status) params = params.set('status', query.status);
			if (query.year)
				params = params.set('year', query.year.toString());
			if (query.month)
				params = params.set('month', query.month.toString());
		}

		return this.http.get<LeaveRequest[]>(this.apiUrl, { params });
	}

	/**
	 * Get a single leave request by ID
	 */
	getLeaveRequestById(id: number): Observable<LeaveRequest> {
		return this.http.get<LeaveRequest>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Get leave requests for a specific user
	 */
	getLeaveRequestsByUser(userId: number): Observable<LeaveRequest[]> {
		return this.http.get<LeaveRequest[]>(
			`${this.apiUrl}/user/${userId}`
		);
	}

	/**
	 * Approve a leave request (Admin only)
	 */
	approveLeaveRequest(id: number): Observable<LeaveRequest> {
		return this.http.patch<LeaveRequest>(
			`${this.apiUrl}/${id}/approve`,
			{}
		);
	}

	/**
	 * Reject a leave request (Admin only)
	 */
	rejectLeaveRequest(
		id: number,
		rejectionReason?: string
	): Observable<LeaveRequest> {
		const body: RejectLeaveRequestDto = { rejectionReason };
		return this.http.patch<LeaveRequest>(
			`${this.apiUrl}/${id}/reject`,
			body
		);
	}

	/**
	 * Cancel a leave request (by applicant or admin)
	 */
	cancelLeaveRequest(id: number): Observable<LeaveRequest> {
		return this.http.patch<LeaveRequest>(
			`${this.apiUrl}/${id}/cancel`,
			{}
		);
	}

	/**
	 * Get pending leave requests (for admin dashboard)
	 */
	getPendingLeaveRequests(): Observable<LeaveRequest[]> {
		return this.getAllLeaveRequests({
			status: LeaveRequestStatus.PENDING,
		});
	}

	/**
	 * Get leave requests for current year
	 */
	getCurrentYearLeaveRequests(
		userId?: number
	): Observable<LeaveRequest[]> {
		const currentYear = new Date().getFullYear();
		return this.getAllLeaveRequests({ year: currentYear, userId });
	}
}

