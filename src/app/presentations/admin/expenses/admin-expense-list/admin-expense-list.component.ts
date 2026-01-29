import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import {
	Expense,
	ExpenseByMonthQueryDto,
} from '../../../../core/dataservice/expense/expense.interface';
import { ExpenseService } from '../../../../core/dataservice/expense/expense.service';
import { getExpenseTypeLabel, getExpenseSubtypeLabel } from '../../../../core/constants/expense-categories.constants';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminExpenseFormComponent } from '../admin-expense-form/admin-expense-form.component';

@Component({
	selector: 'app-admin-expense-list',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [MessageService, ConfirmationService, DialogService],
	templateUrl: './admin-expense-list.component.html',
	styleUrls: ['./admin-expense-list.component.scss'],
})
export class AdminExpenseListComponent implements OnInit {
	expenses: Expense[] = [];
	loading = false;

	byMonthYear = new Date().getFullYear();
	byMonthMonth = new Date().getMonth() + 1;
	/** Bound to p-calendar (month picker); first day of selected month. */
	selectedMonthDate = new Date(this.byMonthYear, this.byMonthMonth - 1, 1);
	monthOptions = [
		{ label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
		{ label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
		{ label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
		{ label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 },
	];

	first = 0;
	rows = 10;
	totalRecords = 0;

	constructor(
		private expenseService: ExpenseService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadExpenses();
	}

	/** Called when p-calendar (month picker) selection changes. */
	onMonthDateChange() {
		if (this.selectedMonthDate) {
			this.byMonthYear = this.selectedMonthDate.getFullYear();
			this.byMonthMonth = this.selectedMonthDate.getMonth() + 1;
			this.loadExpenses();
		}
	}

	loadExpenses() {
		this.loading = true;
		const q: ExpenseByMonthQueryDto = { year: this.byMonthYear, month: this.byMonthMonth };
		this.expenseService.getByMonth(q).subscribe({
			next: (data) => {
				this.expenses = data || [];
				this.totalRecords = this.expenses.length;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (err) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: err.error?.message || 'Failed to load expenses',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openCreate() {
		const ref = this.dialogService.open(AdminExpenseFormComponent, {
			header: 'Record Expense',
			width: '420px',
			modal: true,
			dismissableMask: true,
		});
		ref.onClose.subscribe((success: boolean) => {
			if (success) this.loadExpenses();
		});
	}

	openEdit(e: Expense) {
		const ref = this.dialogService.open(AdminExpenseFormComponent, {
			header: 'Edit Expense',
			width: '420px',
			modal: true,
			dismissableMask: true,
			data: { expense: e },
		});
		ref.onClose.subscribe((success: boolean) => {
			if (success) this.loadExpenses();
		});
	}

	deleteExpense(e: Expense) {
		this.confirmationService.confirm({
			message: `Delete expense "${e.description}" (Nu. ${this.formatCurrency(e.amount)})?`,
			header: 'Confirm Delete',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.expenseService.delete(e.id).subscribe({
					next: () => {
						this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense deleted' });
						this.loadExpenses();
						this.cdr.markForCheck();
					},
					error: (err) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: err.error?.message || 'Failed to delete expense',
						});
						this.cdr.markForCheck();
					},
				});
			},
		});
	}

	applyFilters() {
		this.first = 0;
		this.loadExpenses();
	}

	clearFilters() {
		const now = new Date();
		this.byMonthYear = now.getFullYear();
		this.byMonthMonth = now.getMonth() + 1;
		this.selectedMonthDate = new Date(this.byMonthYear, this.byMonthMonth - 1, 1);
		this.first = 0;
		this.loadExpenses();
	}

	onPage(event: { first: number; rows: number }) {
		this.first = event.first;
		this.rows = event.rows;
	}

	formatCurrency(v: number | string | null | undefined): string {
		const n = Number(v ?? 0);
		return `Nu. ${(Number.isNaN(n) ? 0 : n).toFixed(2)}`;
	}

	formatDate(s: string | undefined): string {
		if (!s) return '—';
		return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	formatType(type: string | null | undefined): string {
		return getExpenseTypeLabel(type) || '—';
	}

	formatSubtype(type: string | null | undefined, subtype: string | null | undefined): string {
		return getExpenseSubtypeLabel(type, subtype) || '—';
	}

	getTotalAmount(): number {
		return this.expenses.reduce((s, e) => {
			const n = Number(e?.amount ?? 0);
			return s + (Number.isNaN(n) ? 0 : n);
		}, 0);
	}
}
