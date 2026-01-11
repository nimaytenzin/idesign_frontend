import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AttendanceService } from '../../../../core/dataservice/attendance/attendance.service';
import { StaffAttendanceResponseDto } from '../../../../core/dataservice/attendance/attendance.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-staff-attendance',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './staff-attendance.component.html',
	styleUrls: ['./staff-attendance.component.scss'],
})
export class StaffAttendanceComponent implements OnInit, OnDestroy {
	attendanceData: StaffAttendanceResponseDto[] = [];
	loading: boolean = false;
	error: string | null = null;
	
	// Auto-refresh interval
	refreshInterval: any;
	refreshIntervalSeconds: number = 30; // Auto-refresh every 30 seconds

	// Summary stats
	get totalStaff(): number {
		return this.attendanceData.length;
	}

	get presentCount(): number {
		return this.attendanceData.filter(s => s.attendance).length;
	}

	get absentCount(): number {
		return this.attendanceData.filter(s => !s.attendance).length;
	}

	get todayDate(): string {
		return new Date().toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	constructor(
		private attendanceService: AttendanceService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadAttendance();
		this.startAutoRefresh();
	}

	ngOnDestroy() {
		this.stopAutoRefresh();
	}

	loadAttendance() {
		this.loading = true;
		this.error = null;
		
		this.attendanceService.getStaffAttendanceForToday().subscribe({
			next: (data: StaffAttendanceResponseDto[]) => {
				this.attendanceData = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.error = error.error?.message || 'Failed to load attendance data';
				this.loading = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: this.error || undefined,
				});
				this.cdr.markForCheck();
			},
		});
	}

	refresh() {
		this.loadAttendance();
	}

	startAutoRefresh() {
		this.stopAutoRefresh(); // Clear any existing interval
		this.refreshInterval = setInterval(() => {
			this.loadAttendance();
		}, this.refreshIntervalSeconds * 1000);
	}

	stopAutoRefresh() {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		}
	}

	toggleAutoRefresh() {
		if (this.refreshInterval) {
			this.stopAutoRefresh();
		} else {
			this.startAutoRefresh();
		}
	}

	formatTime(dateString: Date | string | undefined): string {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	}

	formatDistance(distance: number | undefined): string {
		if (distance === undefined || distance === null) return 'N/A';
		return `${distance.toFixed(2)} m`;
	}

	getStatusBadge(attendance: StaffAttendanceResponseDto['attendance']) {
		return attendance ? 'Present' : 'Absent';
	}

	getStatusSeverity(attendance: StaffAttendanceResponseDto['attendance']) {
		return attendance ? 'success' : 'danger';
	}

	exportToCSV() {
		const csv = [
			['Name', 'Phone Number', 'Status', 'Time', 'Distance (m)'],
			...this.attendanceData.map(s => [
				s.userName,
				s.userPhoneNumber || 'N/A',
				s.attendance ? 'Present' : 'Absent',
				s.attendance ? this.formatTime(s.attendance.attendanceTime) : 'N/A',
				s.attendance ? s.attendance.distanceFromOffice.toFixed(2) : 'N/A',
			]),
		].map(row => row.join(',')).join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const today = new Date().toISOString().split('T')[0];
		a.download = `attendance-${today}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		this.messageService.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Attendance data exported to CSV',
		});
	}
}
