import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeManagementService } from '../../../../../core/dataservice/hr-management/employee-management.service';
import { StaffMember } from '../../../../../core/dataservice/hr-management/employee-management.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-admin-employee-upload-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-employee-upload-profile.component.html',
	styleUrls: ['./admin-employee-upload-profile.component.scss'],
})
export class AdminEmployeeUploadProfileComponent implements OnInit {
	employee: StaffMember | null = null;
	selectedFile: File | null = null;
	previewUrl: string | undefined = undefined;
	submitted: boolean = false;
	loading: boolean = false;

	constructor(
		private employeeService: EmployeeManagementService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		if (this.config.data?.employee) {
			this.employee = this.config.data.employee as StaffMember;
		}
	}

	ngOnInit() {
		if (!this.employee) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Employee information not found',
			});
			this.ref.close(false);
		}
	}

	onFileSelect(event: any) {
		const file = event.files?.[0] || event.target?.files?.[0];
		if (!file) {
			return;
		}

		// Validate file type
		if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
			this.messageService.add({
				severity: 'error',
				summary: 'Invalid File',
				detail: 'Only image files (JPG, JPEG, PNG, GIF, WEBP) are allowed',
			});
			return;
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			this.messageService.add({
				severity: 'error',
				summary: 'File Too Large',
				detail: 'File size must be less than 5MB',
			});
			return;
		}

		this.selectedFile = file;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e: any) => {
			this.previewUrl = e.target.result;
			this.cdr.markForCheck();
		};
		reader.readAsDataURL(file);
	}

	removeSelectedFile() {
		this.selectedFile = null;
		this.previewUrl = undefined;
		this.cdr.markForCheck();
	}

	uploadProfilePicture() {
		this.submitted = true;

		if (!this.selectedFile) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select an image file to upload',
			});
			return;
		}

		if (!this.employee) {
			return;
		}

		this.loading = true;

		this.employeeService.uploadProfilePicture(this.employee.id, this.selectedFile).subscribe({
			next: (updatedEmployee) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Profile picture uploaded successfully',
				});
				this.loading = false;
				this.ref.close(updatedEmployee);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to upload profile picture',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	cancel() {
		this.ref.close(false);
	}

	getCurrentProfileImageUrl(): string | undefined {
		if (!this.employee?.profileImageUrl) {
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
		if (!this.employee?.name) {
			return 'U';
		}
		return this.employee.name.charAt(0).toUpperCase();
	}
}

