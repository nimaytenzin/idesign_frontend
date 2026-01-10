import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeProfileService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-profile.service';
import {
	UpdateEmployeeProfileDto,
	EmployeeProfile,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee.profile.interface';
import { EmployeeStatus } from '../../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { UserDataService } from '../../../../../core/dataservice/user/user.dataservice';
import { User } from '../../../../../core/dataservice/user/user.interface';

@Component({
	selector: 'app-update-employee-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-employee-profile.component.html',
	styleUrls: ['./update-employee-profile.component.scss'],
})
export class UpdateEmployeeProfileComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	employeeProfile: EmployeeProfile | null = null;

	updateData: {
		userId?: number;
		department?: string;
		position?: string;
		bio?: string;
		hireDate?: Date | string;
		terminationDate?: Date | string | null;
		employeeStatus?: EmployeeStatus;
	} = {};

	statusOptions = [
		{ label: 'Active', value: EmployeeStatus.ACTIVE },
		{ label: 'Inactive', value: EmployeeStatus.INACTIVE },
		{ label: 'Terminated', value: EmployeeStatus.TERMINATED },
	];

	constructor(
		private employeeProfileService: EmployeeProfileService,
		private userDataService: UserDataService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.employeeProfile = this.config.data.employeeProfile;
			if (this.employeeProfile) {
				// Convert date strings to Date objects for the calendar
				const hireDate = this.employeeProfile.hireDate
					? new Date(this.employeeProfile.hireDate)
					: null;
				const terminationDate = this.employeeProfile.terminationDate
					? new Date(this.employeeProfile.terminationDate)
					: null;

				this.updateData = {
					userId: this.employeeProfile.userId,
					department: this.employeeProfile.department,
					position: this.employeeProfile.position,
					bio: this.employeeProfile.bio || '',
					hireDate: hireDate || undefined,
					terminationDate: terminationDate || undefined,
					employeeStatus: this.employeeProfile.employeeStatus,
				};
			}
		}
	}



	saveEmployeeProfile() {
		this.submitted = true;

		if (!this.employeeProfile) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Employee profile not found',
			});
			return;
		}

		// Validate required fields if they are being updated
		if (
			this.updateData.department !== undefined &&
			!this.updateData.department?.trim()
		) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Department cannot be empty',
			});
			return;
		}

		if (
			this.updateData.position !== undefined &&
			!this.updateData.position?.trim()
		) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Position cannot be empty',
			});
			return;
		}

		this.loading = true;

		// Format dates to ISO 8601 string if provided
		const dto: UpdateEmployeeProfileDto = {
			userId: this.updateData.userId,
			department: this.updateData.department,
			position: this.updateData.position,
			bio: this.updateData.bio,
			hireDate: this.updateData.hireDate ? new Date(this.updateData.hireDate) : new Date(),
			terminationDate: this.updateData.terminationDate ? new Date(this.updateData.terminationDate) : null,
			employeeStatus: this.updateData.employeeStatus,
		};

		// Trim string fields
		if (dto.department) {
			dto.department = dto.department.trim();
		}
		if (dto.position) {
			dto.position = dto.position.trim();
		}
		if (dto.bio) {
			dto.bio = dto.bio.trim();
		}

		this.employeeProfileService
			.updateEmployeeProfile(this.employeeProfile.id, dto)
			.subscribe({
				next: (updatedProfile: EmployeeProfile) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Employee profile updated successfully',
					});
					this.loading = false;
					if (this.ref) {
						this.ref.close(updatedProfile);
					}
				},
				error: (error: any) => {
					let errorMessage = 'Failed to update employee profile';
					if (error.error?.message) {
						if (Array.isArray(error.error.message)) {
							errorMessage = error.error.message.join(', ');
						} else if (typeof error.error.message === 'string') {
							errorMessage = error.error.message;
						}
					}
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: errorMessage,
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}

	formatDate(date: Date): string {
		if (!date) return '';
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
}
