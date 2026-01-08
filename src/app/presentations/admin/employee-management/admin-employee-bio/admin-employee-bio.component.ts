import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { 
	StaffMember, 
	EmployeeStatus, 
	EmployeeEducation, 
	EmployeeWorkExperience 
} from '../../../../core/dataservice/employee-management/employee-management.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { environment } from '../../../../../environments/environment';
import { EmployeeManagementService } from '../../../../core/dataservice/employee-management/employee-management.service';

@Component({
	selector: 'app-admin-employee-bio',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-employee-bio.component.html',
	styleUrls: ['./admin-employee-bio.component.scss'],
})
export class AdminEmployeeBioComponent implements OnInit {
	@ViewChild('fileUpload') fileUpload!: any;

	employee!: StaffMember;
	educations: EmployeeEducation[] = [];
	workExperiences: EmployeeWorkExperience[] = [];
	loadingEducation: boolean = false;
	loadingWorkExperience: boolean = false;
	uploadingProfile: boolean = false;

	constructor(
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig,
		private employeeService: EmployeeManagementService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		if (this.config.data && this.config.data.employee) {
			this.employee = this.config.data.employee;
			this.loadEducations();
			this.loadWorkExperiences();
		}
	}

	loadEducations() {
		this.loadingEducation = true;
		this.employeeService.getStaffEducation(this.employee.id).subscribe({
			next: (data) => {
				this.educations = data;
				this.loadingEducation = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading education:', error);
				this.educations = [];
				this.loadingEducation = false;
				this.cdr.markForCheck();
			},
		});
	}

	loadWorkExperiences() {
		this.loadingWorkExperience = true;
		this.employeeService.getStaffWorkExperience(this.employee.id).subscribe({
			next: (data) => {
				this.workExperiences = data;
				this.loadingWorkExperience = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading work experience:', error);
				this.workExperiences = [];
				this.loadingWorkExperience = false;
				this.cdr.markForCheck();
			},
		});
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	getStatusClasses(status: EmployeeStatus): string {
		switch (status) {
			case EmployeeStatus.ACTIVE:
				return 'text-xs rounded-full px-3 py-1 font-medium bg-green-50 text-green-700 dark:bg-green-500 dark:bg-opacity-15 dark:text-green-500';
			case EmployeeStatus.INACTIVE:
				return 'text-xs rounded-full px-3 py-1 font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-500 dark:bg-opacity-15 dark:text-yellow-500';
			case EmployeeStatus.TERMINATED:
				return 'text-xs rounded-full px-3 py-1 font-medium bg-red-50 text-red-700 dark:bg-red-500 dark:bg-opacity-15 dark:text-red-500';
			default:
				return 'text-xs rounded-full px-3 py-1 font-medium bg-gray-50 text-gray-700 dark:bg-gray-500 dark:bg-opacity-15 dark:text-gray-500';
		}
	}

	close() {
		this.ref.close();
	}

	getProfileImageUrl(): string | undefined {
		if (!this.employee.profileImageUrl) {
			return undefined;
		}
		// If the URL already starts with http, return as is
		if (this.employee.profileImageUrl.startsWith('http')) {
			return this.employee.profileImageUrl;
		}
		// Otherwise, construct the full URL
		const cleanPath = this.employee.profileImageUrl.startsWith('/')
			? this.employee.profileImageUrl.substring(1)
			: this.employee.profileImageUrl;
		return `${environment.BASEAPI_URL}/${cleanPath}`;
	}

	getEmployeeInitial(): string {
		if (!this.employee.name) {
			return 'U';
		}
		return this.employee.name.charAt(0).toUpperCase();
	}

	formatDateShort(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	getDurationDays(days: number): string {
		if (!days) return 'N/A';
		const years = Math.floor(days / 365);
		const months = Math.floor((days % 365) / 30);
		if (years > 0 && months > 0) {
			return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
		} else if (years > 0) {
			return `${years} year${years > 1 ? 's' : ''}`;
		} else if (months > 0) {
			return `${months} month${months > 1 ? 's' : ''}`;
		} else {
			return `${days} day${days > 1 ? 's' : ''}`;
		}
	}

	onProfilePictureSelect(event: any) {
		const file = event.files[0];
		if (!file) return;

		// Validate file type
		if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
			this.messageService.add({
				severity: 'error',
				summary: 'Invalid File',
				detail: 'Only image files (JPG, PNG, GIF, WEBP) are allowed',
			});
			this.fileUpload.clear();
			return;
		}

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			this.messageService.add({
				severity: 'error',
				summary: 'File Too Large',
				detail: 'File size must be less than 5MB',
			});
			this.fileUpload.clear();
			return;
		}

		this.uploadProfilePicture(file);
	}

	uploadProfilePicture(file: File) {
		this.uploadingProfile = true;
		this.employeeService.uploadProfilePicture(this.employee.id, file).subscribe({
			next: (updatedEmployee) => {
				this.employee = updatedEmployee;
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Profile picture uploaded successfully',
				});
				this.uploadingProfile = false;
				this.fileUpload.clear();
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Upload Failed',
					detail: error.error?.message || 'Failed to upload profile picture',
				});
				this.uploadingProfile = false;
				this.fileUpload.clear();
				this.cdr.markForCheck();
			},
		});
	}
}

