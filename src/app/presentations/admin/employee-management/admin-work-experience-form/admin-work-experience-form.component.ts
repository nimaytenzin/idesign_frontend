import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeManagementService } from '../../../../core/dataservice/employee-management/employee-management.service';
import {
	StaffMember,
	EmployeeWorkExperience,
	CreateWorkExperienceDto,
	UpdateWorkExperienceDto,
} from '../../../../core/dataservice/employee-management/employee-management.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-work-experience-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-work-experience-form.component.html',
	styleUrls: ['./admin-work-experience-form.component.scss'],
})
export class AdminWorkExperienceFormComponent implements OnInit {
	employee: StaffMember | null = null;
	workExperience: Partial<EmployeeWorkExperience> = {};
	isEditMode: boolean = false;
	submitted: boolean = false;
	loading: boolean = false;

	// Form fields
	positionTitle: string = '';
	effectiveDate: string = '';
	agency: string = '';
	place: string = '';
	endDate: string | null = null;
	isCurrentPosition: boolean = false;

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

		if (this.config.data?.workExperience) {
			const we = this.config.data.workExperience as EmployeeWorkExperience;
			this.workExperience = { ...we };
			this.isEditMode = true;
			this.loadWorkExperienceData(we);
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

	loadWorkExperienceData(we: EmployeeWorkExperience) {
		this.positionTitle = we.positionTitle || '';
		this.agency = we.agency || '';
		this.place = we.place || '';
		this.isCurrentPosition = !we.endDate;

		// Format dates for input fields
		if (we.effectiveDate) {
			const effective = typeof we.effectiveDate === 'string' ? new Date(we.effectiveDate) : we.effectiveDate;
			this.effectiveDate = effective.toISOString().split('T')[0];
		}
		if (we.endDate) {
			const end = typeof we.endDate === 'string' ? new Date(we.endDate) : we.endDate;
			this.endDate = end.toISOString().split('T')[0];
		} else {
			this.endDate = null;
		}
	}

	onCurrentPositionChange() {
		if (this.isCurrentPosition) {
			this.endDate = null;
		}
	}

	saveWorkExperience() {
		this.submitted = true;

		// Validation
		if (!this.positionTitle || !this.effectiveDate || !this.agency || !this.place) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		// Date validation
		if (!this.isCurrentPosition && this.endDate) {
			const effective = new Date(this.effectiveDate);
			const end = new Date(this.endDate);
			if (end < effective) {
				this.messageService.add({
					severity: 'warn',
					summary: 'Validation',
					detail: 'End date must be after effective date',
				});
				return;
			}
		}

		if (!this.employee) {
			return;
		}

		this.loading = true;

		if (this.isEditMode && this.workExperience.id) {
			// Update existing work experience
			const updateData: UpdateWorkExperienceDto = {
				positionTitle: this.positionTitle,
				effectiveDate: this.effectiveDate,
				agency: this.agency,
				place: this.place,
				endDate: this.isCurrentPosition ? null : (this.endDate || null),
			};

			this.employeeService
				.updateWorkExperience(this.employee.id, this.workExperience.id, updateData)
				.subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Work experience updated successfully',
						});
						this.loading = false;
						this.ref.close(true);
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to update work experience',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
		} else {
			// Create new work experience
			const createData: CreateWorkExperienceDto = {
				positionTitle: this.positionTitle,
				effectiveDate: this.effectiveDate,
				agency: this.agency,
				place: this.place,
				endDate: this.isCurrentPosition ? null : (this.endDate || null),
			};

			this.employeeService.addWorkExperience(this.employee.id, createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Work experience added successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to add work experience',
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

