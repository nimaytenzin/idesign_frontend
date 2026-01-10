import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { EmployeeManagementService } from '../../../../../core/dataservice/hr-management/employee-management.service';
import {
	StaffMember,
	EmployeeEducation,
} from '../../../../../core/dataservice/hr-management/employee-management.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { AdminEducationFormComponent } from '../admin-education-form/admin-education-form.component';

@Component({
	selector: 'app-admin-education-list',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, ConfirmationService, DialogService],
	templateUrl: './admin-education-list.component.html',
	styleUrls: ['./admin-education-list.component.scss'],
})
export class AdminEducationListComponent implements OnInit {
	employee: StaffMember | null = null;
	educations: EmployeeEducation[] = [];
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
		this.loadEducations();
	}

	loadEducations() {
		if (!this.employee) return;

		this.loading = true;
		this.employeeService.getStaffEducation(this.employee.id).subscribe({
			next: (data) => {
				this.educations = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load education qualifications',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openNewEducation() {
		if (!this.employee) return;

		const ref = this.dialogService.open(AdminEducationFormComponent, {
			header: 'Add Education Qualification',
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
				this.loadEducations();
			}
		});
	}

	editEducation(education: EmployeeEducation) {
		if (!this.employee) return;

		const ref = this.dialogService.open(AdminEducationFormComponent, {
			header: 'Edit Education Qualification',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee: this.employee, education },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadEducations();
			}
		});
	}

	deleteEducation(education: EmployeeEducation) {
		if (!this.employee) return;

		this.confirmationService.confirm({
			message: `Are you sure you want to delete this education qualification? This action cannot be undone.`,
			header: 'Delete Education Qualification',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.employeeService
					.deleteEducation(this.employee!.id, education.id)
					.subscribe({
						next: () => {
							this.messageService.add({
								severity: 'success',
								summary: 'Success',
								detail: 'Education qualification deleted successfully',
							});
							this.loadEducations();
						},
						error: (error) => {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: error.error?.message || 'Failed to delete education qualification',
							});
						},
					});
			},
		});
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
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

