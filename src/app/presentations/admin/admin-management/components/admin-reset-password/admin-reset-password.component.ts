import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AuthService } from '../../../../../core/dataservice/auth/auth.service';
import { AdminResetPasswordDto } from '../../../../../core/dataservice/auth/auth.interface';
import { User } from '../../../../../core/dataservice/user/user.interface';
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
	loading: boolean = false;
	submitted: boolean = false;
	user: User | null = null;
	newPassword: string = '';
	confirmPassword: string = '';

	constructor(
		private authService: AuthService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.user = this.config.data.user;
		}
	}

	resetPassword() {
		this.submitted = true;

		if (!this.user) {
			return;
		}

		// Validate password
		if (!this.newPassword || this.newPassword.length < 6) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Password must be at least 6 characters long',
			});
			return;
		}

		// Validate password confirmation
		if (this.newPassword !== this.confirmPassword) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Passwords do not match',
			});
			return;
		}

		this.loading = true;

		const resetPasswordDto: AdminResetPasswordDto = {
			userId: this.user.id,
			newPassword: this.newPassword,
		};

		this.authService.adminResetPassword(resetPasswordDto).subscribe({
			next: (response) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: response.message || 'Password reset successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(true);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to reset password';
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

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
