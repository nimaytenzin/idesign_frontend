import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ChartOfAccountsService } from '../../../../core/dataservice/chart-of-accounts/chart-of-accounts.service';
import {
	ChartOfAccounts,
	CreateChartOfAccountsDto,
	UpdateChartOfAccountsDto,
	AccountType,
	NormalBalance,
	AccountTypeHelper,
} from '../../../../core/dataservice/chart-of-accounts/chart-of-accounts.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-chart-of-accounts',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, ConfirmationService],
	templateUrl: './admin-chart-of-accounts.component.html',
	styleUrls: ['./admin-chart-of-accounts.component.scss'],
})
export class AdminChartOfAccountsComponent implements OnInit {
	@ViewChild('dt') dt!: Table;

	// Data
	accounts: ChartOfAccounts[] = [];
	filteredAccounts: ChartOfAccounts[] = [];
	loading: boolean = false;

	// Dialog state
	showAccountDialog: boolean = false;
	isEditMode: boolean = false;
	submitted: boolean = false;
	selectedAccount: ChartOfAccounts | null = null;

	// Form data
	accountForm: CreateChartOfAccountsDto = {
		accountCode: '',
		accountName: '',
		accountType: AccountType.ASSET,
		normalBalance: NormalBalance.DEBIT,
		description: '',
		isActive: true,
	};

	// Filters
	searchQuery: string = '';
	selectedAccountType: AccountType | 'ALL' = 'ALL';
	selectedStatus: boolean | 'ALL' = 'ALL';

	// Options
	accountTypes = AccountType;
	normalBalances = NormalBalance;
	accountTypeInfo = AccountTypeHelper.TYPES;
	AccountTypeHelper = AccountTypeHelper;
	AccountType = AccountType; // Expose to template

	accountTypeOptions = [
		{ label: 'All Types', value: 'ALL' },
		...AccountTypeHelper.TYPES.map((t) => ({
			label: t.label,
			value: t.value,
		})),
	];

	statusOptions = [
		{ label: 'All', value: 'ALL' },
		{ label: 'Active', value: true },
		{ label: 'Inactive', value: false },
	];

	constructor(
		private chartOfAccountsService: ChartOfAccountsService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadAccounts();
	}

	loadAccounts() {
		this.loading = true;
		this.chartOfAccountsService.getAllAccounts().subscribe({
			next: (accounts) => {
				this.accounts = accounts;
				this.applyFilters();
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load accounts',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	applyFilters() {
		let filtered = [...this.accounts];

		// Filter by type
		if (this.selectedAccountType !== 'ALL') {
			filtered = filtered.filter(
				(a) => a.accountType === this.selectedAccountType
			);
		}

		// Filter by status
		if (this.selectedStatus !== 'ALL') {
			filtered = filtered.filter((a) => a.isActive === this.selectedStatus);
		}

		// Filter by search query
		if (this.searchQuery) {
			const query = this.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(a) =>
					a.accountCode.toLowerCase().includes(query) ||
					a.accountName.toLowerCase().includes(query) ||
					(a.description &&
						a.description.toLowerCase().includes(query))
			);
		}

		this.filteredAccounts = filtered;
	}

	onSearchChange() {
		this.applyFilters();
	}

	onTypeFilterChange() {
		this.applyFilters();
	}

	onStatusFilterChange() {
		this.applyFilters();
	}

	clearFilters() {
		this.searchQuery = '';
		this.selectedAccountType = 'ALL';
		this.selectedStatus = 'ALL';
		this.applyFilters();
		if (this.dt) {
			this.dt.clear();
		}
	}

	openNewAccountDialog() {
		this.isEditMode = false;
		this.selectedAccount = null;
		this.submitted = false;
		this.accountForm = {
			accountCode: '',
			accountName: '',
			accountType: AccountType.ASSET,
			normalBalance: NormalBalance.DEBIT,
			description: '',
			isActive: true,
		};
		this.showAccountDialog = true;
	}

	openEditAccountDialog(account: ChartOfAccounts) {
		this.isEditMode = true;
		this.selectedAccount = account;
		this.submitted = false;
		this.accountForm = {
			accountCode: account.accountCode,
			accountName: account.accountName,
			accountType: account.accountType,
			normalBalance: account.normalBalance,
			description: account.description || '',
			isActive: account.isActive,
		};
		this.showAccountDialog = true;
	}

	onAccountTypeChange() {
		// Auto-set normal balance based on account type
		if (this.accountForm.accountType) {
			this.accountForm.normalBalance =
				AccountTypeHelper.getDefaultNormalBalance(
					this.accountForm.accountType
				);
		}
	}

	saveAccount() {
		this.submitted = true;

		if (!this.isFormValid()) {
			return;
		}

		this.loading = true;

		if (this.isEditMode && this.selectedAccount) {
			// Update account
			const updateDto: UpdateChartOfAccountsDto = {
				accountName: this.accountForm.accountName,
				accountType: this.accountForm.accountType,
				normalBalance: this.accountForm.normalBalance,
				description: this.accountForm.description,
				isActive: this.accountForm.isActive,
			};

			this.chartOfAccountsService
				.updateAccount(this.selectedAccount.accountCode, updateDto)
				.subscribe({
					next: (account) => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Account updated successfully',
						});
						this.showAccountDialog = false;
						this.loadAccounts();
						this.loading = false;
						this.cdr.markForCheck();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail:
								error.error?.message ||
								'Failed to update account',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
		} else {
			// Create account
			this.chartOfAccountsService
				.createAccount(this.accountForm)
				.subscribe({
					next: (account) => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Account created successfully',
						});
						this.showAccountDialog = false;
						this.loadAccounts();
						this.loading = false;
						this.cdr.markForCheck();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail:
								error.error?.message ||
								'Failed to create account',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
		}
	}

	deleteAccount(account: ChartOfAccounts) {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete account "${account.accountCode} - ${account.accountName}"?`,
			header: 'Confirm Delete',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.chartOfAccountsService
					.deleteAccount(account.accountCode)
					.subscribe({
						next: () => {
							this.messageService.add({
								severity: 'success',
								summary: 'Success',
								detail: 'Account deleted successfully',
							});
							this.loadAccounts();
							this.loading = false;
							this.cdr.markForCheck();
						},
						error: (error) => {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail:
									error.error?.message ||
									'Failed to delete account. Account may have existing transactions.',
							});
							this.loading = false;
							this.cdr.markForCheck();
						},
					});
			},
		});
	}

	isFormValid(): boolean {
		return !!(
			this.accountForm.accountCode &&
			this.accountForm.accountCode.trim().length > 0 &&
			this.accountForm.accountName &&
			this.accountForm.accountName.trim().length > 0 &&
			this.accountForm.accountType &&
			this.accountForm.normalBalance
		);
	}

	getAccountTypeLabel(type: AccountType): string {
		return AccountTypeHelper.getLabel(type);
	}

	getAccountTypeColor(type: AccountType): string {
		return AccountTypeHelper.getTypeInfo(type).color;
	}
}

