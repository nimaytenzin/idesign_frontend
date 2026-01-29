import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { BankAccount } from '../../../../../core/dataservice/bank-account/bank-account.interface';
import { BankAccountService } from '../../../../../core/dataservice/bank-account/bank-account.service';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { AdminBankAccountFormComponent } from '../components/admin-bank-account-form/admin-bank-account-form.component';

@Component({
	selector: 'app-admin-list-bank-accounts',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-list-bank-accounts.component.html',
	styleUrls: ['./admin-list-bank-accounts.component.scss'],
})
export class AdminListBankAccountsComponent implements OnInit {
	@ViewChild('bankTable') bankTable!: Table;

	accounts: BankAccount[] = [];
	loading = false;
	globalFilter = '';
	activeOnlyFilter: boolean | null = null;

	first = 0;
	rows = 10;
	totalRecords = 0;

	activeFilterOptions = [
		{ label: 'All', value: null },
		{ label: 'Active only', value: true },
		{ label: 'Inactive only', value: false },
	];

	constructor(
		private bankAccountService: BankAccountService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadAccounts();
	}

	loadAccounts(): void {
		this.loading = true;
		const activeOnly = this.activeOnlyFilter === true ? true : undefined;
		this.bankAccountService.getAll(activeOnly).subscribe({
			next: (data) => {
				if (this.activeOnlyFilter === false) {
					this.accounts = data.filter((a) => !a.isActive);
				} else {
					this.accounts = data;
				}
				this.totalRecords = this.accounts.length;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (err) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: err.error?.message || 'Failed to load bank accounts',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onPageChange(event: { first: number; rows: number }): void {
		this.first = event.first;
		this.rows = event.rows;
		this.totalRecords = this.accounts.length;
	}

	onFilterChange(): void {
		this.loadAccounts();
	}

	clearFilters(): void {
		this.globalFilter = '';
		this.activeOnlyFilter = null;
		if (this.bankTable) {
			this.bankTable.clear();
			this.bankTable.reset();
		}
		this.loadAccounts();
	}

	openCreate(): void {
		const ref = this.dialogService.open(AdminBankAccountFormComponent, {
			header: 'Create Bank Account',
			width: '90%',
			style: { 'max-width': '500px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});
		ref.onClose.subscribe((success: boolean) => {
			if (success) this.loadAccounts();
		});
	}

	openEdit(account: BankAccount): void {
		const ref = this.dialogService.open(AdminBankAccountFormComponent, {
			header: 'Edit Bank Account',
			width: '90%',
			style: { 'max-width': '500px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { bankAccount: account },
		});
		ref.onClose.subscribe((success: boolean) => {
			if (success) this.loadAccounts();
		});
	}

	deleteAccount(account: BankAccount): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${account.accountName}"?`,
			header: 'Delete Bank Account',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.bankAccountService.delete(account.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Bank account deleted',
						});
						this.loadAccounts();
					},
					error: (err) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: err.error?.message || 'Failed to delete bank account',
						});
					},
				});
			},
		});
	}

	getStatusSeverity(isActive: boolean): string {
		return isActive ? 'success' : 'secondary';
	}

	getStatusClasses(isActive: boolean): string {
		return isActive
			? 'text-xs rounded-full px-2 py-0.5 font-medium bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500'
			: 'text-xs rounded-full px-2 py-0.5 font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
	}
}
