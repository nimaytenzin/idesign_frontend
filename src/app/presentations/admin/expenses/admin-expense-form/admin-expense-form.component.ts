import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CreateExpenseDto, Expense } from '../../../../core/dataservice/expense/expense.interface';
import { ExpenseService } from '../../../../core/dataservice/expense/expense.service';
import { EXPENSE_TYPES, getExpenseSubtypes } from '../../../../core/constants/expense-categories.constants';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-expense-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-expense-form.component.html',
	styleUrls: ['./admin-expense-form.component.scss'],
})
export class AdminExpenseFormComponent {
	form: CreateExpenseDto = {
		type: undefined,
		subtype: undefined,
		description: '',
		amount: 0,
		date: new Date().toISOString().split('T')[0],
		notes: '',
	};
	readonly typeOptions = EXPENSE_TYPES;
	isEditMode = false;
	submitted = false;
	loading = false;

	constructor(
		private expenseService: ExpenseService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		const expense = this.config.data?.expense as Expense | undefined;
		if (expense) {
			this.isEditMode = true;
			this.form = {
				type: expense.type ?? undefined,
				subtype: expense.subtype ?? undefined,
				description: expense.description,
				amount: expense.amount,
				date: (expense.date || '').toString().split('T')[0] || new Date().toISOString().split('T')[0],
				notes: expense.notes ?? '',
			};
		} else {
			this.form = {
				type: undefined,
				subtype: undefined,
				description: '',
				amount: 0,
				date: new Date().toISOString().split('T')[0],
				notes: '',
			};
		}
	}

	save() {
		this.submitted = true;
		if (!this.form.amount || this.form.amount < 0 || !(this.form.description || '').trim() || !this.form.date) {
			this.cdr.markForCheck();
			return;
		}
		const dto: CreateExpenseDto = {
			type: (this.form.type || '').trim() || undefined,
			subtype: (this.form.subtype || '').trim() || undefined,
			description: (this.form.description || '').trim(),
			amount: this.form.amount,
			date: this.form.date,
			notes: (this.form.notes || '').trim() || undefined,
		};

		this.loading = true;
		this.cdr.markForCheck();

		if (this.isEditMode && this.config.data?.expense) {
			const id = (this.config.data.expense as Expense).id;
			this.expenseService.update(id, dto).subscribe({
				next: () => {
					this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense updated' });
					this.loading = false;
					this.ref.close(true);
					this.cdr.markForCheck();
				},
				error: (err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: err.error?.message || 'Failed to update expense',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			this.expenseService.create(dto).subscribe({
				next: () => {
					this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Expense recorded' });
					this.loading = false;
					this.ref.close(true);
					this.cdr.markForCheck();
				},
				error: (err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: err.error?.message || 'Failed to create expense',
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

	get subtypeOptions(): { value: string; label: string }[] {
		return getExpenseSubtypes(this.form.type);
	}

	onTypeChange(): void {
		this.form.subtype = undefined;
	}
}
