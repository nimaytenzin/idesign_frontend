import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AccountService } from '../../../../core/dataservice/account/account.service';
import {
	ProfitLossResponseDto,
	ProfitLossQueryDto,
	RevenueAccount,
	ExpenseAccount,
} from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-profit-loss',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-profit-loss.component.html',
	styleUrls: ['./admin-profit-loss.component.scss'],
})
export class AdminProfitLossComponent implements OnInit {
	// Data
	profitLossData: ProfitLossResponseDto | null = null;
	loading: boolean = false;

	// Filters
	selectedDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
	selectedYear: number = new Date().getFullYear();
	selectedMonthNumber: number = new Date().getMonth() + 1; // getMonth() returns 0-11, API expects 1-12
	format: 'summary' | 'detailed' = 'detailed';

	// UI State
	expandedRevenueAccounts: Set<string> = new Set();
	expandedExpenseAccounts: Set<string> = new Set();

	constructor(
		private accountService: AccountService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadProfitLoss();
	}

	/**
	 * Load Profit & Loss statement for the selected month
	 */
	loadProfitLoss() {
		this.loading = true;
		this.accountService
			.getProfitLossByMonth(this.selectedYear, this.selectedMonthNumber, this.format)
			.subscribe({
				next: (data) => {
					this.profitLossData = data;
					this.loading = false;
					this.cdr.markForCheck();
				},
				error: (error) => {
					console.error('Error loading Profit & Loss:', error);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to load Profit & Loss statement',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
	}

	/**
	 * Handle month selection change
	 */
	onMonthChange() {
		if (this.selectedDate) {
			this.selectedYear = this.selectedDate.getFullYear();
			this.selectedMonthNumber = this.selectedDate.getMonth() + 1; // getMonth() returns 0-11, API expects 1-12
			this.loadProfitLoss();
		}
	}

	/**
	 * Toggle format between summary and detailed
	 */
	toggleFormat() {
		this.format = this.format === 'summary' ? 'detailed' : 'summary';
		this.loadProfitLoss();
	}

	/**
	 * Toggle revenue account expansion
	 */
	toggleRevenueAccount(accountCode: string) {
		if (this.expandedRevenueAccounts.has(accountCode)) {
			this.expandedRevenueAccounts.delete(accountCode);
		} else {
			this.expandedRevenueAccounts.add(accountCode);
		}
	}

	/**
	 * Toggle expense account expansion
	 */
	toggleExpenseAccount(accountCode: string) {
		if (this.expandedExpenseAccounts.has(accountCode)) {
			this.expandedExpenseAccounts.delete(accountCode);
		} else {
			this.expandedExpenseAccounts.add(accountCode);
		}
	}

	/**
	 * Check if revenue account is expanded
	 */
	isRevenueAccountExpanded(accountCode: string): boolean {
		return this.expandedRevenueAccounts.has(accountCode);
	}

	/**
	 * Check if expense account is expanded
	 */
	isExpenseAccountExpanded(accountCode: string): boolean {
		return this.expandedExpenseAccounts.has(accountCode);
	}

	/**
	 * Format currency
	 */
	formatCurrency(amount: number): string {
		return `Nu. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}

	/**
	 * Format percentage
	 */
	formatPercentage(value: number): string {
		return `${value.toFixed(2)}%`;
	}

	/**
	 * Get month label
	 */
	getMonthLabel(): string {
		if (!this.selectedDate) return '';
		return this.selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
	}

	/**
	 * Export to CSV
	 */
	exportToCSV() {
		if (!this.profitLossData) return;

		const rows: string[] = [];
		rows.push('Profit & Loss Statement');
		rows.push(`Period: ${this.getMonthLabel()}`);
		rows.push('');

		// Revenue section
		rows.push('REVENUE');
		rows.push('Account Code,Account Name,Amount');
		if (this.profitLossData.revenue.breakdown) {
			this.profitLossData.revenue.breakdown.forEach((account) => {
				rows.push(`${account.accountCode},"${account.accountName}",${account.amount}`);
			});
		}
		rows.push(`Total Revenue,${this.profitLossData.revenue.total}`);
		rows.push('');

		// Expenses section
		rows.push('EXPENSES');
		rows.push('Account Code,Account Name,Amount');
		if (this.profitLossData.expenses.breakdown) {
			this.profitLossData.expenses.breakdown.forEach((account) => {
				rows.push(`${account.accountCode},"${account.accountName}",${account.amount}`);
			});
		}
		rows.push(`Total Expenses,${this.profitLossData.expenses.total}`);
		rows.push('');

		// Summary
		rows.push('SUMMARY');
		rows.push(`Gross Profit,${this.profitLossData.grossProfit}`);
		rows.push(`Gross Profit Margin,${this.profitLossData.grossProfitMargin}%`);
		rows.push(`Net Income,${this.profitLossData.netIncome}`);
		rows.push(`Net Profit Margin,${this.profitLossData.netProfitMargin}%`);

		const csvContent = rows.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `profit-loss-${this.selectedYear}-${this.selectedMonthNumber}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

