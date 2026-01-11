import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeEducationService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-education.service';
import {
	CreateEmployeeEducationDto,
	EmployeeEducation,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee.education.interface';
import { EmployeeEducationLevel, EmployeeEducationStatus } from '../../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-create-employee-education',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-employee-education.component.html',
	styleUrls: ['./create-employee-education.component.scss'],
})
export class CreateEmployeeEducationComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;

	createData: CreateEmployeeEducationDto = {
		employeeProfileId: 0,
		level: EmployeeEducationLevel.BACHELOR,
		courseTitle: '',
		institute: '',
		startDate: '',
		endDate: '',
		status: EmployeeEducationStatus.COMPLETED,
	};

	levelOptions = [
		{ label: 'Primary', value: EmployeeEducationLevel.PRIMARY },
		{ label: 'Secondary', value: EmployeeEducationLevel.SECONDARY },
		{ label: 'Diploma', value: EmployeeEducationLevel.DIPLOMA },
		{ label: 'Certificate', value: EmployeeEducationLevel.CERTIFICATE },
		{ label: 'Bachelor', value: EmployeeEducationLevel.BACHELOR },
		{ label: 'Master', value: EmployeeEducationLevel.MASTER },
		{ label: 'PhD', value: EmployeeEducationLevel.PHD },
	];

	statusOptions = [
		{ label: 'Completed', value: EmployeeEducationStatus.COMPLETED },
		{ label: 'Incomplete', value: EmployeeEducationStatus.INCOMPLETE },
	];

	constructor(
		private educationService: EmployeeEducationService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	userId: number = 0;

	ngOnInit() {
		if (this.config?.data) {
			this.createData.employeeProfileId = this.config.data.employeeProfileId;
			this.userId = this.config.data.userId || 0;
		}
	}

	saveEducation() {
		this.submitted = true;

		if (
			!this.createData.employeeProfileId ||
			!this.createData.courseTitle?.trim() ||
			!this.createData.institute?.trim() ||
			!this.createData.startDate ||
			!this.createData.endDate
		) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		this.loading = true;

		const dto: CreateEmployeeEducationDto = {
			employeeProfileId: this.createData.employeeProfileId,
			level: this.createData.level,
			courseTitle: this.createData.courseTitle.trim(),
			institute: this.createData.institute.trim(),
			startDate: this.formatDate(this.createData.startDate),
			endDate: this.formatDate(this.createData.endDate),
			status: this.createData.status,
		};

		if (!this.userId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'User ID is required',
			});
			this.loading = false;
			return;
		}

		this.educationService.createEmployeeEducation(this.userId, dto).subscribe({
			next: (education: EmployeeEducation) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Education record created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(education);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create education record';
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

	formatDate(date: Date | string): string {
		if (!date) return '';
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
