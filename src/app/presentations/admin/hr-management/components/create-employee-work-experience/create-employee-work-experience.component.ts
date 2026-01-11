import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeWorkExperienceService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-work-experience.service';
import {
	CreateEmployeeWorkExperienceDto,
	EmployeeWorkExperience,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee.work-experience.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-create-employee-work-experience',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-employee-work-experience.component.html',
	styleUrls: ['./create-employee-work-experience.component.scss'],
})
export class CreateEmployeeWorkExperienceComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	userId: number = 0;

	createData: CreateEmployeeWorkExperienceDto = {
		employeeProfileId: 0,
		positionTitle: '',
		effectiveDate: '',
		agency: '',
		place: '',
		endDate: '',
	};

	constructor(
		private workExperienceService: EmployeeWorkExperienceService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.createData.employeeProfileId = this.config.data.employeeProfileId;
			this.userId = this.config.data.userId || 0;
		}
	}

	saveWorkExperience() {
		this.submitted = true;

		if (
			!this.createData.employeeProfileId ||
			!this.createData.positionTitle?.trim() ||
			!this.createData.agency?.trim() ||
			!this.createData.place?.trim() ||
			!this.createData.effectiveDate ||
			!this.createData.endDate
		) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		if (!this.userId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'User ID is required',
			});
			this.loading = false;
			return;
		}

		this.loading = true;

		const dto: CreateEmployeeWorkExperienceDto = {
			employeeProfileId: this.createData.employeeProfileId,
			positionTitle: this.createData.positionTitle.trim(),
			agency: this.createData.agency.trim(),
			place: this.createData.place.trim(),
			effectiveDate: this.formatDate(this.createData.effectiveDate),
			endDate: this.formatDate(this.createData.endDate),
		};

		this.workExperienceService.createEmployeeWorkExperience(this.userId, dto).subscribe({
			next: (experience: EmployeeWorkExperience) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Work experience record created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(experience);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create work experience record';
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
