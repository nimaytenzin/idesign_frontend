import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeManagementService } from '../../../../../core/dataservice/hr-management/employee-management.service';
import { StaffMember, ResetPasswordDto } from '../../../../../core/dataservice/hr-management/employee-management.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-admin-reset-password',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-reset-password.component.html',
	styleUrls: ['./admin-reset-password.component.scss'],
})
export class AdminResetPasswordComponent implements OnInit {
	employee: StaffMember | null = null;
	newPassword: string = '';
	confirmPassword: string = '';
	submitted: boolean = false;
	loading: boolean = false;

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

	resetPassword() {
		this.submitted = true;

		// Validation
		if (!this.newPassword || this.newPassword.length < 6) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Password must be at least 6 characters long',
			});
			return;
		}

		if (this.newPassword !== this.confirmPassword) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Passwords do not match',
			});
			return;
		}

		if (!this.employee) {
			return;
		}

		this.loading = true;

		const passwordData: ResetPasswordDto = {
			newPassword: this.newPassword,
		};

		this.employeeService.resetStaffPassword(this.employee.id, passwordData).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Password reset successfully',
				});
				this.loading = false;
				this.ref.close(true);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to reset password',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	cancel() {
		this.ref.close(false);
	}
}

