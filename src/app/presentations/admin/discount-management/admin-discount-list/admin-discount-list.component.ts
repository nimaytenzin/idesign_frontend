import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import {
	DiscountResponseDto,
	DiscountQueryDto,
	DiscountType,
	DiscountValueType,
	DiscountScope,
} from '../../../../core/dataservice/discount/discount.interface';
import { DiscountService } from '../../../../core/dataservice/discount/discount.service';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminDiscountFormComponent } from '../admin-discount-form/admin-discount-form.component';
import { Table } from 'primeng/table';

@Component({
	selector: 'app-admin-discount-list',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-discount-list.component.html',
	styleUrls: ['./admin-discount-list.component.scss'],
})
export class AdminDiscountListComponent implements OnInit {
	@ViewChild('discountTable') discountTable!: Table;

	discounts: DiscountResponseDto[] = [];
	selectedDiscounts: DiscountResponseDto[] = [];
	loading: boolean = false;
	globalFilter: string = '';

	// Filters
	discountTypeFilter: DiscountType | null = null;
	isActiveFilter: boolean | null = null;

	// Pagination
	first: number = 0;
	rows: number = 7;
	totalRecords: number = 0;

	// Filter options
	discountTypeOptions = [
		{ label: 'All Types', value: null },
		{ label: 'All Products', value: DiscountType.FLAT_ALL_PRODUCTS },
		{ label: 'Selected Products', value: DiscountType.FLAT_SELECTED_PRODUCTS },
		{ label: 'Selected Categories', value: DiscountType.FLAT_SELECTED_CATEGORIES },
	];

	activeStatusOptions = [
		{ label: 'All', value: null },
		{ label: 'Active', value: true },
		{ label: 'Inactive', value: false },
	];

	DiscountType = DiscountType;
	DiscountValueType = DiscountValueType;
	DiscountScope = DiscountScope;

	constructor(
		private discountService: DiscountService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadDiscounts();
	}

	loadDiscounts() {
		this.loading = true;
		const query: DiscountQueryDto = {};
		if (this.discountTypeFilter) {
			query.discountType = this.discountTypeFilter;
		}
		if (this.isActiveFilter !== null) {
			query.isActive = this.isActiveFilter;
		}

		this.discountService.getDiscounts(query).subscribe({
			next: (data) => {
				this.discounts = data;
				this.totalRecords = data.length;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load discounts',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onPageChange(event: any): void {
		this.first = event.first;
		this.rows = event.rows;
		this.totalRecords = this.discounts.length;
	}

	onFilterChange() {
		this.loadDiscounts();
	}

	clearFilters() {
		this.globalFilter = '';
		this.discountTypeFilter = null;
		this.isActiveFilter = null;
		if (this.discountTable) {
			this.discountTable.clear();
			this.discountTable.reset();
		}
		this.loadDiscounts();
	}

	onStatusFilterChange(event: any): void {
		this.isActiveFilter = event.value;
		if (this.discountTable) {
			if (event.value !== null) {
				this.discountTable.filter(event.value, 'isActive', 'equals');
			} else {
				this.discountTable.filter(null, 'isActive', 'equals');
			}
		}
	}

	openNewDiscount() {
		const ref = this.dialogService.open(AdminDiscountFormComponent, {
			header: 'Create Discount',
			width: '90%',
			style: { 'max-width': '900px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadDiscounts();
			}
		});
	}

	editDiscount(discount: DiscountResponseDto) {
		const ref = this.dialogService.open(AdminDiscountFormComponent, {
			header: 'Edit Discount',
			width: '90%',
			style: { 'max-width': '900px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { discount },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadDiscounts();
			}
		});
	}

	deleteDiscount(discount: DiscountResponseDto) {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete discount "${discount.name}"?`,
			header: 'Delete Discount',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.discountService.deleteDiscount(discount.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Discount deleted successfully',
						});
						this.loadDiscounts();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete discount',
						});
					},
				});
			},
		});
	}

	toggleActive(discount: DiscountResponseDto) {
		this.discountService.toggleDiscountActive(discount.id).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: `Discount ${!discount.isActive ? 'activated' : 'deactivated'} successfully`,
				});
				this.loadDiscounts();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to update discount',
				});
			},
		});
	}

	getDiscountTypeLabel(type: DiscountType): string {
		const option = this.discountTypeOptions.find((opt) => opt.value === type);
		return option?.label || type;
	}

	getValueTypeLabel(valueType: DiscountValueType): string {
		return valueType === DiscountValueType.PERCENTAGE ? 'Percentage' : 'Fixed Amount';
	}

	getScopeLabel(scope: DiscountScope): string {
		return scope === DiscountScope.PER_PRODUCT ? 'Per Product' : 'Order Total';
	}

	getStatusSeverity(isActive: boolean): string {
		return isActive ? 'success' : 'secondary';
	}

	getToggleButtonSeverity(isActive: boolean): 'success' | 'secondary' {
		return isActive ? 'secondary' : 'success';
	}

	formatDiscountValue(discount: DiscountResponseDto): string {
		if (discount.valueType === DiscountValueType.PERCENTAGE) {
			return `${discount.discountValue}%`;
		}
		return `Nu. ${discount.discountValue}`;
	}

	isExpired(discount: DiscountResponseDto): boolean {
		return new Date(discount.endDate) < new Date();
	}

	isUpcoming(discount: DiscountResponseDto): boolean {
		return new Date(discount.startDate) > new Date();
	}

	getDateStatusSeverity(discount: DiscountResponseDto): string {
		if (this.isExpired(discount)) return 'danger';
		if (this.isUpcoming(discount)) return 'info';
		return 'success';
	}

	getDateStatusLabel(discount: DiscountResponseDto): string {
		if (this.isExpired(discount)) return 'Expired';
		if (this.isUpcoming(discount)) return 'Upcoming';
		return 'Active';
	}

	getStatusClasses(isActive: boolean): string {
		if (isActive) {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-green-50 text-green-700 dark:bg-green-500 dark:bg-opacity-15 dark:text-green-500';
		} else {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-red-50 text-red-700 dark:bg-red-500 dark:bg-opacity-15 dark:text-red-500';
		}
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}
}

