import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AccountService } from '../../../../core/dataservice/account/account.service';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import {
	Expense,
	CreateExpenseDto,
	UpdateExpenseDto,
	ExpenseQueryDto,
	PaymentMethod,
} from '../../../../core/dataservice/account/account.interface';
import {
	ChartOfAccount,
	AccountType,
} from '../../../../core/dataservice/order/order.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-expense-recording',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, ConfirmationService],
	templateUrl: './admin-expense-recording.component.html',
	styleUrls: ['./admin-expense-recording.component.scss'],
})
export class AdminExpenseRecordingComponent implements OnInit {
	// Data
	expenses: Expense[] = [];
	loading: boolean = false;
	submitted: boolean = false;

	// Dialog state
	showExpenseDialog: boolean = false;
	isEditMode: boolean = false;
	selectedExpense: Expense | null = null;

	// Form data
	expenseForm: CreateExpenseDto = {
		expenseDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
		accountCode: '',
		amount: 0,
		paymentMethod: 'MBOB',
		description: '',
		vendor: '',
		receiptNumber: '',
		category: '',
		autoPost: false,
	};

	// Filters
	filterQuery: ExpenseQueryDto = {
		startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
			.toISOString()
			.split('T')[0],
		endDate: new Date().toISOString().split('T')[0],
		isPosted: undefined,
	};

	// Options
	paymentMethods: { label: string; value: PaymentMethod }[] = [
		{ label: 'Cash', value: 'CASH' },
		{ label: 'MBOB', value: 'MBOB' },
		{ label: 'BDB ePay', value: 'BDB_EPAY' },
		{ label: 'TPay', value: 'TPAY' },
		{ label: 'BNB mPay', value: 'BNB_MPAY' },
		{ label: 'ZPSS', value: 'ZPSS' },
	];

	expenseCategories: string[] = [
		'Office',
		'Rent',
		'Utilities',
		'Marketing',
		'Travel',
		'Professional Services',
		'Equipment',
		'Insurance',
		'Salaries',
		'Maintenance',
		'Other',
	];

	// Account options
	expenseAccounts: ChartOfAccount[] = [];
	cashAccounts: ChartOfAccount[] = [];
	allAccounts: ChartOfAccount[] = [];

	// Pagination
	currentPage: number = 1;
	pageSize: number = 20;
	totalRecords: number = 0;

	// Posted status filter options
	postedStatusOptions = [
		{ label: 'All', value: undefined },
		{ label: 'Posted', value: true },
		{ label: 'Draft', value: false },
	];

	constructor(
		private accountService: AccountService,
		private orderService: OrderService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadAccounts();
		this.loadExpenses();
	}

	/**
	 * Load chart of accounts and filter for expense and cash accounts
	 */
	loadAccounts() {
		this.orderService.getChartOfAccounts().subscribe({
			next: (accounts) => {
				this.allAccounts = accounts;
				// Filter expense accounts (EXPENSE type)
				this.expenseAccounts = accounts.filter(
					(acc) => acc.accountType === AccountType.EXPENSE && acc.isActive
				);
				// Filter cash/asset accounts (ASSET type)
				this.cashAccounts = accounts.filter(
					(acc) => acc.accountType === AccountType.ASSET && acc.isActive
				);
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load accounts',
				});
			},
		});
	}

	/**
	 * Load expenses with current filters
	 */
	loadExpenses() {
		this.loading = true;
		const query: ExpenseQueryDto = {
			...this.filterQuery,
			page: this.currentPage,
			limit: this.pageSize,
		};

		this.accountService.getExpenses(query).subscribe({
			next: (expenses) => {
				this.expenses = expenses;
				this.totalRecords = expenses.length; // Note: API might not return total, adjust if needed
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load expenses',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	/**
	 * Open dialog to create new expense
	 */
	openNewExpenseDialog() {
		this.isEditMode = false;
		this.selectedExpense = null;
		this.submitted = false;
		this.expenseForm = {
			expenseDate: new Date().toISOString().split('T')[0],
			accountCode: '',
			amount: 0,
			paymentMethod: 'MBOB',
			description: '',
			vendor: '',
			receiptNumber: '',
			category: '',
			autoPost: false,
		};
		this.showExpenseDialog = true;
	}

	/**
	 * Open dialog to edit expense
	 */
	openEditExpenseDialog(expense: Expense) {
		if (expense.isPosted) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Cannot Edit',
				detail: 'Posted expenses cannot be edited. Create a reversal entry if needed.',
			});
			return;
		}

		this.isEditMode = true;
		this.selectedExpense = expense;
		this.submitted = false;
		this.expenseForm = {
			expenseDate: expense.expenseDate.split('T')[0],
			accountCode: expense.accountCode,
			amount: expense.amount,
			paymentMethod: expense.paymentMethod,
			description: expense.description || '',
			vendor: expense.vendor || '',
			receiptNumber: expense.receiptNumber || '',
			category: expense.category || '',
			cashAccountCode: expense.cashAccountCode,
		};
		this.showExpenseDialog = true;
	}

	/**
	 * Save expense (create or update)
	 */
	saveExpense() {
		this.submitted = true;

		if (!this.isFormValid()) {
			return;
		}

		this.loading = true;

		if (this.isEditMode && this.selectedExpense) {
			// Update expense
			const updateDto: UpdateExpenseDto = {
				expenseDate: this.expenseForm.expenseDate,
				accountCode: this.expenseForm.accountCode,
				amount: this.expenseForm.amount,
				paymentMethod: this.expenseForm.paymentMethod,
				description: this.expenseForm.description,
				vendor: this.expenseForm.vendor,
				receiptNumber: this.expenseForm.receiptNumber,
				category: this.expenseForm.category,
				cashAccountCode: this.expenseForm.cashAccountCode,
			};

			this.accountService.updateExpense(this.selectedExpense.id, updateDto).subscribe({
				next: (expense) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Expense updated successfully',
					});
					this.showExpenseDialog = false;
					this.loadExpenses();
					this.loading = false;
					this.cdr.markForCheck();
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update expense',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			// Create expense
			this.accountService.createExpense(this.expenseForm).subscribe({
				next: (expense) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: expense.isPosted
							? 'Expense created and posted successfully'
							: 'Expense created successfully',
					});
					this.showExpenseDialog = false;
					this.loadExpenses();
					this.loading = false;
					this.cdr.markForCheck();
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create expense',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	/**
	 * Delete expense
	 */
	deleteExpense(expense: Expense) {
		if (expense.isPosted) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Cannot Delete',
				detail: 'Posted expenses cannot be deleted.',
			});
			return;
		}

		this.confirmationService.confirm({
			message: `Are you sure you want to delete this expense?`,
			header: 'Confirm Delete',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.accountService.deleteExpense(expense.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Expense deleted successfully',
						});
						this.loadExpenses();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete expense',
						});
					},
				});
			},
		});
	}

	/**
	 * Post expense to ledger
	 */
	postExpenseToLedger(expense: Expense) {
		if (expense.isPosted) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Already Posted',
				detail: 'This expense is already posted to the ledger.',
			});
			return;
		}

		this.confirmationService.confirm({
			message: `Are you sure you want to post this expense to the ledger? This will create double-entry transactions.`,
			header: 'Confirm Post',
			icon: 'pi pi-check-circle',
			accept: () => {
				this.loading = true;
				this.accountService.postExpenseToLedger(expense.id).subscribe({
					next: (updatedExpense) => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Expense posted to ledger successfully',
						});
						this.loadExpenses();
						this.loading = false;
						this.cdr.markForCheck();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to post expense',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
			},
		});
	}

	/**
	 * Validate form
	 */
	isFormValid(): boolean {
		return !!(
			this.expenseForm.expenseDate &&
			this.expenseForm.accountCode &&
			this.expenseForm.amount &&
			this.expenseForm.amount > 0 &&
			this.expenseForm.paymentMethod
		);
	}

	/**
	 * Apply filters
	 */
	applyFilters() {
		this.currentPage = 1;
		this.loadExpenses();
	}

	/**
	 * Clear filters
	 */
	clearFilters() {
		this.filterQuery = {
			startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
				.toISOString()
				.split('T')[0],
			endDate: new Date().toISOString().split('T')[0],
			isPosted: undefined,
		};
		this.currentPage = 1;
		this.loadExpenses();
	}

	/**
	 * Format currency
	 */
	formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'BTN',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	}

	/**
	 * Format date
	 */
	formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	/**
	 * Get expense account name
	 */
	getExpenseAccountName(accountCode: string): string {
		const account = this.expenseAccounts.find((acc) => acc.accountCode === accountCode);
		return account ? account.accountName : accountCode;
	}

	/**
	 * Get payment method label
	 */
	getPaymentMethodLabel(method: PaymentMethod): string {
		const option = this.paymentMethods.find((m) => m.value === method);
		return option ? option.label : method;
	}

	/**
	 * On page change (pagination)
	 */
	onPageChange(event: any) {
		this.currentPage = event.page + 1; // PrimeNG paginator is 0-based
		this.pageSize = event.rows;
		this.loadExpenses();
	}

	/**
	 * Export expenses to CSV
	 */
	exportToCSV() {
		const headers = [
			'Date',
			'Account Code',
			'Account Name',
			'Amount',
			'Payment Method',
			'Description',
			'Vendor',
			'Receipt Number',
			'Category',
			'Status',
		];

		const rows = this.expenses.map((expense) => [
			this.formatDate(expense.expenseDate),
			expense.accountCode,
			this.getExpenseAccountName(expense.accountCode),
			expense.amount.toFixed(2),
			this.getPaymentMethodLabel(expense.paymentMethod),
			expense.description || '',
			expense.vendor || '',
			expense.receiptNumber || '',
			expense.category || '',
			expense.isPosted ? 'Posted' : 'Draft',
		]);

		const csvContent = [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join(','))
			.join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute(
			'download',
			`expenses-${new Date().toISOString().split('T')[0]}.csv`
		);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

