import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	AttendanceResponseDto,
	StaffAttendanceResponseDto,
	CreateAttendanceDto,
} from './attendance.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AttendanceService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/attendance`;

	constructor(private http: HttpClient) {}

	/**
	 * Mark attendance for a staff user with location validation
	 * POST /attendance/mark
	 * @param createDto Attendance data with lat/long coordinates
	 * @returns Observable of AttendanceResponseDto
	 */
	markAttendance(createDto: CreateAttendanceDto): Observable<AttendanceResponseDto> {
		return this.http.post<AttendanceResponseDto>(`${this.apiUrl}/mark`, createDto);
	}

	/**
	 * Get all staff users with their attendance status for today
	 * GET /attendance
	 * @returns Observable of StaffAttendanceResponseDto array
	 */
	getStaffAttendanceForToday(): Observable<StaffAttendanceResponseDto[]> {
		return this.http.get<StaffAttendanceResponseDto[]>(this.apiUrl);
	}

	/**
	 * Get today's attendance for the authenticated staff user
	 * GET /attendance/me
	 * Access: STAFF only
	 * Uses authenticated user's ID from JWT token
	 * @returns Observable of AttendanceResponseDto if attendance exists for today, null otherwise
	 */
	getTodayAttendanceByUserId(): Observable<AttendanceResponseDto | null> {
		return this.http.get<AttendanceResponseDto | null>(`${this.apiUrl}/me`);
	}
}
