import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AttendanceService } from '../../../core/dataservice/attendance/attendance.service';
import {
	StaffAttendanceResponseDto,
	AttendanceResponseDto,
	CreateAttendanceDto,
} from '../../../core/dataservice/attendance/attendance.interface';
import { PrimeNgModules } from '../../../primeng.modules';

@Component({
	selector: 'app-staff-attendance-viewer',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './staff-attendance-viewer.component.html',
	styleUrls: ['./staff-attendance-viewer.component.scss'],
})
export class StaffAttendanceViewerComponent implements OnInit, OnDestroy {
	attendanceData: StaffAttendanceResponseDto[] = [];
	myAttendance: AttendanceResponseDto | null = null;
	loading: boolean = false;
	markingAttendance: boolean = false;
	error: string | null = null;
	autoMarkAttempted: boolean = false; // Track if we've already tried to auto-mark
	
	// GPS Location details
	gpsAccuracy: number | null = null;
	gpsLatitude: number | null = null;
	gpsLongitude: number | null = null;
	gpsAccuracyWarning: boolean = false;

	// Auto-refresh interval
	refreshInterval: any;
	refreshIntervalSeconds: number = 60; // Auto-refresh every 60 seconds

	// Summary stats
	get totalStaff(): number {
		return this.attendanceData.length;
	}

	get presentCount(): number {
		return this.attendanceData.filter((s) => s.attendance).length;
	}

	get absentCount(): number {
		return this.attendanceData.filter((s) => !s.attendance).length;
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
		this.loadMyAttendance();
		this.loadAttendance();
		this.startAutoRefresh();
	}

	ngOnDestroy() {
		this.stopAutoRefresh();
	}

	loadMyAttendance() {
		this.attendanceService.getTodayAttendanceByUserId().subscribe({
			next: (data: AttendanceResponseDto | null) => {
				this.myAttendance = data;
				// Auto-mark attendance if not marked and we haven't tried yet
				if (!data && !this.autoMarkAttempted && !this.markingAttendance) {
					this.autoMarkAttempted = true;
					this.markAttendance();
				}
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				console.error('Error loading my attendance:', error);
				this.cdr.markForCheck();
			},
		});
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
		// Reset auto-mark flag on manual refresh
		this.autoMarkAttempted = false;
		this.loadMyAttendance();
		this.loadAttendance();
	}

	startAutoRefresh() {
		this.stopAutoRefresh(); // Clear any existing interval
		this.refreshInterval = setInterval(() => {
			this.loadMyAttendance();
			this.loadAttendance();
		}, this.refreshIntervalSeconds * 1000);
	}

	stopAutoRefresh() {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
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

	getStatusBadge(attendance: StaffAttendanceResponseDto['attendance']) {
		return attendance ? 'Present' : 'Absent';
	}

	getStatusSeverity(attendance: StaffAttendanceResponseDto['attendance']) {
		return attendance ? 'success' : 'danger';
	}

	markAttendance() {
		if (this.markingAttendance) return;

		this.markingAttendance = true;
		this.error = null;

		// Request geolocation
		if (!navigator.geolocation) {
			this.error = 'Geolocation is not supported by your browser';
			this.markingAttendance = false;
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Geolocation is not supported by your browser',
			});
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				// Extract GPS details
				const accuracy = position.coords.accuracy; // accuracy in meters
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				
				// Store GPS details
				this.gpsAccuracy = accuracy;
				this.gpsLatitude = latitude;
				this.gpsLongitude = longitude;
				
				// Check accuracy and show warning if signal is too weak
				if (accuracy > 100) {
					this.gpsAccuracyWarning = true;
					console.warn('GPS Signal too weak, please step near a window.');
					this.messageService.add({
						severity: 'warn',
						summary: 'Weak GPS Signal',
						detail: `GPS accuracy is ${accuracy.toFixed(0)}m. Please step near a window for better accuracy.`,
					});
				} else {
					this.gpsAccuracyWarning = false;
				}

				const createDto: CreateAttendanceDto = {
					lat: latitude,
					long: longitude,
				};

				this.attendanceService.markAttendance(createDto).subscribe({
					next: (response: AttendanceResponseDto) => {
						this.myAttendance = response;
						this.markingAttendance = false;
						const accuracyMessage = accuracy <= 100 
							? `Attendance marked successfully (GPS accuracy: ${accuracy.toFixed(0)}m)`
							: `Attendance marked successfully (GPS accuracy: ${accuracy.toFixed(0)}m - weak signal)`;
						
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: accuracyMessage,
						});
						// Refresh the attendance list
						this.loadAttendance();
						this.cdr.markForCheck();
					},
					error: (error: any) => {
						this.markingAttendance = false;
						const errorMessage =
							error.error?.message ||
							'Failed to mark attendance. Please try again.';
						this.error = errorMessage;
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: errorMessage,
						});
						this.cdr.markForCheck();
					},
				});
			},
			(error) => {
				this.markingAttendance = false;
				let errorMessage = 'Failed to get your location. ';
				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorMessage += 'Please allow location access to mark attendance.';
						break;
					case error.POSITION_UNAVAILABLE:
						errorMessage += 'Location information is unavailable.';
						break;
					case error.TIMEOUT:
						errorMessage += 'Location request timed out.';
						break;
					default:
						errorMessage += 'An unknown error occurred.';
						break;
				}
				this.error = errorMessage;
				this.messageService.add({
					severity: 'error',
					summary: 'Location Error',
					detail: errorMessage,
				});
				this.cdr.markForCheck();
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			}
		);
	}
}
