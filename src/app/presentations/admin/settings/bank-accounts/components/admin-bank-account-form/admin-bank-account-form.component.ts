import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import {
	BankAccount,
	CreateBankAccountDto,
	UpdateBankAccountDto,
} from '../../../../../../core/dataservice/bank-account/bank-account.interface';
import { BankAccountService } from '../../../../../../core/dataservice/bank-account/bank-account.service';
import { PrimeNgModules } from '../../../../../../primeng.modules';
@Component({
	selector: 'app-admin-bank-account-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-bank-account-form.component.html',
	styleUrls: ['./admin-bank-account-form.component.scss'],
})
export class AdminBankAccountFormComponent {
	model: {
		accountName: string;
		bankName: string;
		accountNumber: string;
		isActive: boolean;
		useForRmaPg: boolean;
	} = {
		accountName: '',
		bankName: '',
		accountNumber: '',
		isActive: true,
		useForRmaPg: false,
	};
	isEditMode = false;
	editId: number | null = null;
	submitted = false;
	loading = false;

	constructor(
		private bankAccountService: BankAccountService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig
	) {
		if (this.config.data?.bankAccount) {
			const b = this.config.data.bankAccount as BankAccount;
			this.isEditMode = true;
			this.editId = b.id;
			this.model = {
				accountName: b.accountName,
				bankName: b.bankName,
				accountNumber: b.accountNumber,
				isActive: b.isActive,
				useForRmaPg: b.useForRmaPg,
			};
		}
	}

	validate(): boolean {
		this.submitted = true;
		if (!this.model.accountName?.trim()) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Account name is required',
			});
			return false;
		}
		if (!this.model.bankName?.trim()) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Bank name is required',
			});
			return false;
		}
		if (!this.model.accountNumber?.trim()) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Account number is required',
			});
			return false;
		}
		return true;
	}

	save(): void {
		if (!this.validate()) return;
		this.loading = true;

		if (this.isEditMode && this.editId != null) {
			const dto: UpdateBankAccountDto = {
				accountName: this.model.accountName.trim(),
				bankName: this.model.bankName.trim(),
				accountNumber: this.model.accountNumber.trim(),
				isActive: this.model.isActive,
				useForRmaPg: this.model.useForRmaPg,
			};
			this.bankAccountService.update(this.editId, dto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Bank account updated successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: err.error?.message || 'Failed to update bank account',
					});
					this.loading = false;
				},
			});
		} else {
			const dto: CreateBankAccountDto = {
				accountName: this.model.accountName.trim(),
				bankName: this.model.bankName.trim(),
				accountNumber: this.model.accountNumber.trim(),
				isActive: this.model.isActive,
				useForRmaPg: this.model.useForRmaPg,
			};
			this.bankAccountService.create(dto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Bank account created successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: err.error?.message || 'Failed to create bank account',
					});
					this.loading = false;
				},
			});
		}
	}

	cancel(): void {
		this.ref.close(false);
	}
}
