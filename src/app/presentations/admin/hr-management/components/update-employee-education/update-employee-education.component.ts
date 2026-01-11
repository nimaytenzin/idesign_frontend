import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeEducationService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-education.service';
import {
	UpdateEmployeeEducationDto,
	EmployeeEducation,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee.education.interface';
import { EmployeeEducationLevel, EmployeeEducationStatus } from '../../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-update-employee-education',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-employee-education.component.html',
	styleUrls: ['./update-employee-education.component.scss'],
})
export class UpdateEmployeeEducationComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	education: EmployeeEducation | null = null;
	userId: number = 0;

	updateData: {
		level?: EmployeeEducationLevel;
		courseTitle?: string;
		institute?: string;
		startDate?: Date;
		endDate?: Date;
		status?: EmployeeEducationStatus;
	} = {};

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

	ngOnInit() {
		if (this.config?.data) {
			this.education = this.config.data.education;
			this.userId = this.config.data.userId;
			if (this.education) {
				this.updateData = {
					level: this.education.level,
					courseTitle: this.education.courseTitle,
					institute: this.education.institute,
					startDate: this.formatDateForInput(this.education.startDate),
					endDate: this.formatDateForInput(this.education.endDate),
					status: this.education.status,
				};
			}
		}
	}

	formatDateForInput(date: Date | string): Date {
		if (!date) return new Date();
		return new Date(date);
	}

	saveEducation() {
		this.submitted = true;

		if (!this.education || !this.userId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Education data not found',
			});
			return;
		}

		this.loading = true;

		const dto: UpdateEmployeeEducationDto = {};
		if (this.updateData.level !== undefined) dto.level = this.updateData.level;
		if (this.updateData.courseTitle !== undefined) dto.courseTitle = this.updateData.courseTitle.trim();
		if (this.updateData.institute !== undefined) dto.institute = this.updateData.institute.trim();
		if (this.updateData.startDate) dto.startDate = this.formatDate(this.updateData.startDate as Date);
		if (this.updateData.endDate) dto.endDate = this.formatDate(this.updateData.endDate as Date);
		if (this.updateData.status !== undefined) dto.status = this.updateData.status;

		this.educationService.updateEmployeeEducation(this.userId, this.education.id, dto).subscribe({
			next: (updatedEducation: EmployeeEducation) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Education record updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(updatedEducation);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update education record';
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
