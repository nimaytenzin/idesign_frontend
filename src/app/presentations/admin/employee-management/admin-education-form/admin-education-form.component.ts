import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeManagementService } from '../../../../core/dataservice/employee-management/employee-management.service';
import {
	StaffMember,
	EmployeeEducation,
	CreateEducationDto,
	UpdateEducationDto,
} from '../../../../core/dataservice/employee-management/employee-management.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-education-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-education-form.component.html',
	styleUrls: ['./admin-education-form.component.scss'],
})
export class AdminEducationFormComponent implements OnInit {
	employee: StaffMember | null = null;
	education: Partial<EmployeeEducation> = {};
	isEditMode: boolean = false;
	submitted: boolean = false;
	loading: boolean = false;

	// Form fields
	level: string = '';
	courseTitle: string = '';
	institute: string = '';
	startDate: string = '';
	endDate: string = '';
	durationDays: number | null = null;
	funding: string = '';
	status: string = 'Completed';

	// Status options
	statusOptions = [
		{ label: 'Completed', value: 'Completed' },
		{ label: 'Ongoing', value: 'Ongoing' },
		{ label: 'Discontinued', value: 'Discontinued' },
	];

	// Level options
	levelOptions = [
		{ label: 'Class X', value: 'Class X' },
		{ label: 'Class XII', value: 'Class XII' },
		{ label: 'Bachelors', value: 'Bachelors' },
		{ label: 'Masters', value: 'Masters' },
		{ label: 'PhD', value: 'PhD' },
		{ label: 'Other', value: 'Other' },
	];

	customLevel: string = '';

	get showCustomLevel(): boolean {
		return this.level === 'Other';
	}

	onLevelChange() {
		if (this.level !== 'Other') {
			this.customLevel = '';
		}
	}

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

		if (this.config.data?.education) {
			const edu = this.config.data.education as EmployeeEducation;
			this.education = { ...edu };
			this.isEditMode = true;
			this.loadEducationData(edu);
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

	loadEducationData(edu: EmployeeEducation) {
		// Check if level is in the predefined options
		const levelOption = this.levelOptions.find(opt => opt.value === edu.level);
		if (levelOption) {
			this.level = edu.level || '';
			this.customLevel = '';
		} else {
			// Custom level - set to "Other" and populate customLevel
			this.level = 'Other';
			this.customLevel = edu.level || '';
		}

		this.courseTitle = edu.courseTitle || '';
		this.institute = edu.institute || '';
		this.status = edu.status || 'Completed';
		this.funding = edu.funding || '';
		this.durationDays = edu.durationDays || null;

		// Format dates for input fields
		if (edu.startDate) {
			const start = typeof edu.startDate === 'string' ? new Date(edu.startDate) : edu.startDate;
			this.startDate = start.toISOString().split('T')[0];
		}
		if (edu.endDate) {
			const end = typeof edu.endDate === 'string' ? new Date(edu.endDate) : edu.endDate;
			this.endDate = end.toISOString().split('T')[0];
		}
	}

	calculateDuration() {
		if (this.startDate && this.endDate) {
			const start = new Date(this.startDate);
			const end = new Date(this.endDate);
			const diffTime = Math.abs(end.getTime() - start.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			this.durationDays = diffDays;
		}
	}

	onDateChange() {
		this.calculateDuration();
	}

	saveEducation() {
		this.submitted = true;

		// Validation
		if (!this.level || !this.courseTitle || !this.institute || !this.startDate || !this.endDate || !this.status) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		// Validate custom level if "Other" is selected
		if (this.level === 'Other' && !this.customLevel) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please enter a custom education level',
			});
			return;
		}

		// Date validation
		const start = new Date(this.startDate);
		const end = new Date(this.endDate);
		if (end < start) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'End date must be after start date',
			});
			return;
		}

		// Calculate duration if not provided
		if (!this.durationDays) {
			this.calculateDuration();
		}

		if (!this.employee) {
			return;
		}

		this.loading = true;

		// Use custom level if "Other" is selected
		const finalLevel = this.level === 'Other' && this.customLevel ? this.customLevel : this.level;

		if (this.isEditMode && this.education.id) {
			// Update existing education
			const updateData: UpdateEducationDto = {
				level: finalLevel,
				courseTitle: this.courseTitle,
				institute: this.institute,
				startDate: this.startDate,
				endDate: this.endDate,
				durationDays: this.durationDays || undefined,
				funding: this.funding || undefined,
				status: this.status,
			};

			this.employeeService
				.updateEducation(this.employee.id, this.education.id, updateData)
				.subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Education qualification updated successfully',
						});
						this.loading = false;
						this.ref.close(true);
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to update education qualification',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
		} else {
			// Create new education
			const createData: CreateEducationDto = {
				level: finalLevel,
				courseTitle: this.courseTitle,
				institute: this.institute,
				startDate: this.startDate,
				endDate: this.endDate,
				durationDays: this.durationDays || undefined,
				funding: this.funding || undefined,
				status: this.status,
			};

			this.employeeService.addEducation(this.employee.id, createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Education qualification added successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to add education qualification',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	cancel() {
		this.ref.close(false);
	}
}

