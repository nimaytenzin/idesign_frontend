import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AffiliateMarketerService } from '../../../../core/dataservice/affiliate-marketer/affiliate-marketer.service';
import {
	AffiliateMarketer,
	CreateAffiliateMarketerDto,
	UpdateAffiliateMarketerDto,
} from '../../../../core/dataservice/affiliate-marketer/affiliate-marketer.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-affiliate-marketer-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-affiliate-marketer-form.component.html',
	styleUrls: ['./admin-affiliate-marketer-form.component.scss'],
})
export class AdminAffiliateMarketerFormComponent implements OnInit {
	affiliate: Partial<AffiliateMarketer> = {};
	isEditMode: boolean = false;
	submitted: boolean = false;
	loading: boolean = false;

	// Form fields
	name: string = '';
	cid: string = '';
	email: string = '';
	password: string = '';
	voucherCode: string = '';
	discountPercentage: number = 0;
	commissionPercentage: number = 0;
	phoneNumber: string = '';
	isActive: boolean = true;

	constructor(
		private affiliateService: AffiliateMarketerService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		// Check if editing existing affiliate
		if (this.config.data?.affiliate) {
			const aff = this.config.data.affiliate as AffiliateMarketer;
			this.affiliate = { ...aff };
			this.isEditMode = true;
			this.loadAffiliateData(aff);
		}
	}

	ngOnInit() {
		// Component initialized
	}

	loadAffiliateData(aff: AffiliateMarketer) {
		this.name = aff.name || '';
		this.cid = aff.cid || '';
		this.email = aff.email || '';
		this.voucherCode = aff.voucherCode || '';
		this.discountPercentage = aff.discountPercentage || 0;
		this.commissionPercentage = aff.commissionPercentage || 0;
		this.phoneNumber = aff.phoneNumber || '';
		this.isActive = aff.isActive !== undefined ? aff.isActive : true;
	}

	saveAffiliate() {
		this.submitted = true;

		// Validation
		if (!this.name || !this.cid || !this.email || !this.voucherCode) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please fill in all required fields (Name, CID, Email, Voucher Code)',
			});
			return;
		}

		if (!this.isEditMode && !this.password) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Password is required for new affiliate marketers',
			});
			return;
		}

		if (this.password && this.password.length < 6) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Password must be at least 6 characters long',
			});
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(this.email)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please enter a valid email address',
			});
			return;
		}

		// Percentage validation
		if (this.discountPercentage < 0 || this.discountPercentage > 100) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Discount percentage must be between 0 and 100',
			});
			return;
		}

		if (this.commissionPercentage < 0 || this.commissionPercentage > 100) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Commission percentage must be between 0 and 100',
			});
			return;
		}

		// Voucher code validation (alphanumeric, uppercase)
		const voucherCodeRegex = /^[A-Z0-9]+$/;
		if (!voucherCodeRegex.test(this.voucherCode)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Voucher code must contain only uppercase letters and numbers',
			});
			return;
		}

		this.loading = true;

		if (this.isEditMode && this.affiliate.id) {
			// Update existing affiliate
			const updateData: UpdateAffiliateMarketerDto = {
				name: this.name,
				cid: this.cid,
				email: this.email,
				voucherCode: this.voucherCode.toUpperCase(),
				discountPercentage: this.discountPercentage,
				commissionPercentage: this.commissionPercentage,
				isActive: this.isActive,
				phoneNumber: this.phoneNumber || undefined,
			};

			this.affiliateService.updateAffiliateMarketer(this.affiliate.id, updateData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Affiliate marketer updated successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update affiliate marketer',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			// Create new affiliate
			const createData: CreateAffiliateMarketerDto = {
				name: this.name,
				cid: this.cid,
				email: this.email,
				password: this.password,
				voucherCode: this.voucherCode.toUpperCase(),
				discountPercentage: this.discountPercentage,
				commissionPercentage: this.commissionPercentage,
				isActive: this.isActive !== undefined ? this.isActive : true,
				phoneNumber: this.phoneNumber || undefined,
			};

			this.affiliateService.createAffiliateMarketer(createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Affiliate marketer created successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create affiliate marketer',
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

	generateVoucherCode() {
		// Generate a random voucher code
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 8; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		this.voucherCode = result;
	}
}

