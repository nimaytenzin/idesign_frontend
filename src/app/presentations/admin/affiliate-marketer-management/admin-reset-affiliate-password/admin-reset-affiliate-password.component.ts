import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AffiliateMarketerService } from '../../../../core/dataservice/affiliate-marketer/affiliate-marketer.service';
import { AffiliateMarketer, ResetAffiliatePasswordDto } from '../../../../core/dataservice/affiliate-marketer/affiliate-marketer.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-reset-affiliate-password',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-reset-affiliate-password.component.html',
	styleUrls: ['./admin-reset-affiliate-password.component.scss'],
})
export class AdminResetAffiliatePasswordComponent implements OnInit {
	affiliate: AffiliateMarketer | null = null;
	newPassword: string = '';
	confirmPassword: string = '';
	submitted: boolean = false;
	loading: boolean = false;

	constructor(
		private affiliateService: AffiliateMarketerService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		if (this.config.data?.affiliate) {
			this.affiliate = this.config.data.affiliate as AffiliateMarketer;
		}
	}

	ngOnInit() {
		if (!this.affiliate) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Affiliate marketer information not found',
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

		if (!this.affiliate) {
			return;
		}

		this.loading = true;

		const passwordData: ResetAffiliatePasswordDto = {
			newPassword: this.newPassword,
		};

		this.affiliateService.resetAffiliatePassword(this.affiliate.id, passwordData).subscribe({
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

