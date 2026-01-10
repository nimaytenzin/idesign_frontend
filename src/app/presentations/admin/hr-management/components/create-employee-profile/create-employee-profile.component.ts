import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeProfileService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-profile.service';
import {
	CreateEmployeeProfileDto,
	EmployeeProfile,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee.profile.interface';
import { EmployeeStatus } from '../../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { UserDataService } from '../../../../../core/dataservice/user/user.dataservice';
import { User } from '../../../../../core/dataservice/user/user.interface';

@Component({
	selector: 'app-create-employee-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-employee-profile.component.html',
	styleUrls: ['./create-employee-profile.component.scss'],
})
export class CreateEmployeeProfileComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;

	createData: CreateEmployeeProfileDto = {
		userId: 0,
		department: '',
		position: '',
		hireDate: new Date(),
		bio: '',
 		employeeStatus: EmployeeStatus.ACTIVE,
	};

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
		
		// Set default userId from config if provided
		if (this.config?.data?.userId) {
			this.createData.userId = this.config.data.userId;
		}
	}



	saveEmployeeProfile() {
		this.submitted = true;

		// Validate required fields
		if (
			!this.createData.userId ||
			!this.createData.department ||
			!this.createData.position ||
			!this.createData.hireDate
		) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

 
	 
		this.loading = true;

		const dto: CreateEmployeeProfileDto = {
			userId: this.createData.userId,
			department: this.createData.department.trim(),
			position: this.createData.position.trim(),
			hireDate: new Date(this.createData.hireDate),
			bio: this.createData.bio?.trim() || '',
			employeeStatus: this.createData.employeeStatus,
		};

		this.employeeProfileService.createEmployeeProfile(dto).subscribe({
			next: (profile: EmployeeProfile) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Employee profile created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(profile);
				} else {
					this.resetForm();
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create employee profile';
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

	resetForm() {
		this.createData = {
			userId: 0,
			department: '',
			position: '',
			hireDate: new Date(),
			bio: '',
			employeeStatus: EmployeeStatus.ACTIVE,
		};
		this.submitted = false;
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
