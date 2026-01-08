import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { EmployeeManagementService } from '../../../../core/dataservice/employee-management/employee-management.service';
import {
	StaffMember,
	EmployeeWorkExperience,
} from '../../../../core/dataservice/employee-management/employee-management.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminWorkExperienceFormComponent } from '../admin-work-experience-form/admin-work-experience-form.component';

@Component({
	selector: 'app-admin-work-experience-list',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, ConfirmationService, DialogService],
	templateUrl: './admin-work-experience-list.component.html',
	styleUrls: ['./admin-work-experience-list.component.scss'],
})
export class AdminWorkExperienceListComponent implements OnInit {
	employee: StaffMember | null = null;
	workExperiences: EmployeeWorkExperience[] = [];
	loading: boolean = false;

	constructor(
		private employeeService: EmployeeManagementService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
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
			return;
		}
		this.loadWorkExperiences();
	}

	loadWorkExperiences() {
		if (!this.employee) return;

		this.loading = true;
		this.employeeService.getStaffWorkExperience(this.employee.id).subscribe({
			next: (data) => {
				this.workExperiences = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load work experience',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openNewWorkExperience() {
		if (!this.employee) return;

		const ref = this.dialogService.open(AdminWorkExperienceFormComponent, {
			header: 'Add Work Experience',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee: this.employee },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadWorkExperiences();
			}
		});
	}

	editWorkExperience(workExperience: EmployeeWorkExperience) {
		if (!this.employee) return;

		const ref = this.dialogService.open(AdminWorkExperienceFormComponent, {
			header: 'Edit Work Experience',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee: this.employee, workExperience },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadWorkExperiences();
			}
		});
	}

	deleteWorkExperience(workExperience: EmployeeWorkExperience) {
		if (!this.employee) return;

		this.confirmationService.confirm({
			message: `Are you sure you want to delete this work experience entry? This action cannot be undone.`,
			header: 'Delete Work Experience',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.employeeService
					.deleteWorkExperience(this.employee!.id, workExperience.id)
					.subscribe({
						next: () => {
							this.messageService.add({
								severity: 'success',
								summary: 'Success',
								detail: 'Work experience deleted successfully',
							});
							this.loadWorkExperiences();
						},
						error: (error) => {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: error.error?.message || 'Failed to delete work experience',
							});
						},
					});
			},
		});
	}

	formatDate(date: Date | string | undefined | null): string {
		if (!date) return 'Current';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	close() {
		this.ref.close();
	}
}

