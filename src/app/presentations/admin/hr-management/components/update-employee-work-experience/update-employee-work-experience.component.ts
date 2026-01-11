import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeWorkExperienceService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-work-experience.service';
import {
	UpdateEmployeeWorkExperienceDto,
	EmployeeWorkExperience,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee.work-experience.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-update-employee-work-experience',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-employee-work-experience.component.html',
	styleUrls: ['./update-employee-work-experience.component.scss'],
})
export class UpdateEmployeeWorkExperienceComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	experience: EmployeeWorkExperience | null = null;
	userId: number = 0;

	updateData: {
		positionTitle?: string;
		agency?: string;
		place?: string;
		effectiveDate?: Date;
		endDate?: Date;
	} = {};

	constructor(
		private workExperienceService: EmployeeWorkExperienceService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.experience = this.config.data.experience;
			this.userId = this.config.data.userId;
			if (this.experience) {
				this.updateData = {
					positionTitle: this.experience.positionTitle,
					agency: this.experience.agency,
					place: this.experience.place,
					effectiveDate: this.formatDateForInput(this.experience.effectiveDate),
					endDate: this.formatDateForInput(this.experience.endDate),
				};
			}
		}
	}

	formatDateForInput(date: Date | string): Date {
		if (!date) return new Date();
		return new Date(date);
	}

	saveWorkExperience() {
		this.submitted = true;

		if (!this.experience || !this.userId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Work experience data not found',
			});
			return;
		}

		this.loading = true;

		const dto: UpdateEmployeeWorkExperienceDto = {};
		if (this.updateData.positionTitle !== undefined) dto.positionTitle = this.updateData.positionTitle.trim();
		if (this.updateData.agency !== undefined) dto.agency = this.updateData.agency.trim();
		if (this.updateData.place !== undefined) dto.place = this.updateData.place.trim();
		if (this.updateData.effectiveDate) dto.effectiveDate = this.formatDate(this.updateData.effectiveDate as Date);
		if (this.updateData.endDate) dto.endDate = this.formatDate(this.updateData.endDate as Date);

		this.workExperienceService.updateEmployeeWorkExperience(this.userId, this.experience.id, dto).subscribe({
			next: (updatedExperience: EmployeeWorkExperience) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Work experience record updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(updatedExperience);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update work experience record';
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
