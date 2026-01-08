import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AccountService } from '../../../../core/dataservice/account/account.service';
import {
	GeneralLedgerResponse,
	GeneralLedgerQueryDto,
	GeneralLedgerEntry,
	SourceType,
} from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-general-ledger',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-general-ledger.component.html',
	styleUrls: ['./admin-general-ledger.component.scss'],
})
export class AdminGeneralLedgerComponent implements OnInit {
	// Data
	ledgerData: GeneralLedgerResponse | null = null;
	entries: GeneralLedgerEntry[] = [];
	loading: boolean = false;

	// Filters
	selectedMonth: Date = new Date(); // Month selection (defaults to current month)
	accountCode: string = '';
	search: string = '';

	// Pagination
	currentPage: number = 1;
	pageSize: number = 100;
	totalPages: number = 1;

	// Source Type Options
	sourceTypeOptions = [
		{ label: 'All', value: null },
		{ label: 'Order', value: 'ORDER' },
		{ label: 'Expense', value: 'EXPENSE' },
		{ label: 'Manual', value: 'MANUAL' },
	];
	selectedSourceType: SourceType | null = null;

	// Account Options (will be populated from ledger data)
	accountOptions: { label: string; value: string }[] = [];

	constructor(
		private accountService: AccountService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		// Default to current month
		this.selectedMonth = new Date();
		this.loadLedger();
	}

	loadLedger() {
		this.loading = true;
		const query: GeneralLedgerQueryDto = {
			page: this.currentPage,
			limit: this.pageSize,
		};

		// Use month/year filtering (takes precedence over date range)
		if (this.selectedMonth) {
			query.year = this.selectedMonth.getFullYear();
			query.month = this.selectedMonth.getMonth() + 1; // getMonth() returns 0-11, API expects 1-12
		}

		if (this.accountCode) {
			query.accountCode = this.accountCode;
		}
		if (this.search) {
			query.search = this.search;
		}

		this.accountService.getGeneralLedger(query).subscribe({
			next: (data) => {
				this.ledgerData = data;
				this.entries = data.entries;
				this.totalPages = data.pagination.totalPages;
				this.currentPage = data.pagination.page;

				// Populate account options from accounts summary
				this.accountOptions = [
					{ label: 'All Accounts', value: '' },
					...data.accounts.map((acc) => ({
						label: `${acc.accountCode} - ${acc.accountName}`,
						value: acc.accountCode,
					})),
				];

				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load general ledger',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onFilterChange() {
		this.currentPage = 1;
		this.loadLedger();
	}

	onSearch() {
		this.currentPage = 1;
		this.loadLedger();
	}

	clearFilters() {
		this.selectedMonth = new Date(); // Reset to current month
		this.accountCode = '';
		this.search = '';
		this.selectedSourceType = null;
		this.currentPage = 1;
		this.loadLedger();
	}

	getSelectedMonthLabel(): string {
		if (!this.selectedMonth) return 'Current Month';
		return this.selectedMonth.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
		});
	}

	onPageChange(event: any) {
		this.currentPage = event.page + 1; // PrimeNG paginator is 0-based
		this.loadLedger();
	}

	formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'BTN',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	}

	formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	getSourceTypeBadgeClass(sourceType: SourceType): string {
		switch (sourceType) {
			case 'ORDER':
				return 'bg-blue-100 text-blue-800';
			case 'EXPENSE':
				return 'bg-orange-100 text-orange-800';
			case 'MANUAL':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	filterBySourceType(entry: GeneralLedgerEntry): boolean {
		if (!this.selectedSourceType) {
			return true;
		}
		return entry.sourceType === this.selectedSourceType;
	}

	getFilteredEntries(): GeneralLedgerEntry[] {
		return this.entries.filter((entry) => this.filterBySourceType(entry));
	}

	exportToCSV() {
		if (!this.ledgerData) return;

		const headers = [
			'Date',
			'Account Code',
			'Account Name',
			'Description',
			'Debit',
			'Credit',
			'Balance',
			'Reference',
			'Source Type',
			'Source Reference',
		];

		const rows = this.getFilteredEntries().map((entry) => [
			this.formatDate(entry.date),
			entry.accountCode,
			entry.accountName,
			entry.description,
			entry.debitAmount.toFixed(2),
			entry.creditAmount.toFixed(2),
			entry.balance.toFixed(2),
			entry.referenceNumber,
			entry.sourceType,
			entry.sourceReference,
		]);

		const csvContent = [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join(','))
			.join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `general-ledger-${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

