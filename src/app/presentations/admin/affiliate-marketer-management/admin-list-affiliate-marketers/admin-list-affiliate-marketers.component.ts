import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { TieredMenu } from 'primeng/tieredmenu';
import { AffiliateMarketerService } from '../../../../core/dataservice/affiliate-marketer/affiliate-marketer.service';
import { AffiliateMarketer } from '../../../../core/dataservice/affiliate-marketer/affiliate-marketer.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminAffiliateMarketerFormComponent } from '../admin-affiliate-marketer-form/admin-affiliate-marketer-form.component';
import { AdminResetAffiliatePasswordComponent } from '../admin-reset-affiliate-password/admin-reset-affiliate-password.component';

@Component({
	selector: 'app-admin-list-affiliate-marketers',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-list-affiliate-marketers.component.html',
	styleUrls: ['./admin-list-affiliate-marketers.component.scss'],
})
export class AdminListAffiliateMarketersComponent implements OnInit, AfterViewInit {
	@ViewChild('affiliateTable') affiliateTable!: Table;
	@ViewChildren('actionMenu') actionMenuList!: QueryList<TieredMenu>;

	affiliates: AffiliateMarketer[] = [];
	selectedAffiliates: AffiliateMarketer[] = [];
	loading: boolean = false;
	globalFilter: string = '';

	// Action menu references
	actionMenus: Map<number, TieredMenu> = new Map();

	// Filters
	statusFilter: boolean | null = null;

	// Filter options
	statusOptions = [
		{ label: 'All Statuses', value: null },
		{ label: 'Active', value: true },
		{ label: 'Inactive', value: false },
	];

	// Pagination
	first: number = 0;
	rows: number = 10;
	totalRecords: number = 0;

	constructor(
		private affiliateService: AffiliateMarketerService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadAffiliates();
	}

	ngAfterViewInit(): void {
		this.actionMenuList.changes.subscribe(() => {
			this.updateMenuReferences();
		});
		setTimeout(() => this.updateMenuReferences(), 100);
	}

	private updateMenuReferences(): void {
		if (this.actionMenuList && this.actionMenuList.length > 0) {
			this.actionMenuList.forEach((menu: TieredMenu, index) => {
				if (this.affiliates && this.affiliates[index]) {
					this.actionMenus.set(this.affiliates[index].id, menu);
				}
			});
		}
	}

	toggleActionMenu(event: Event, affiliateId: number): void {
		event.stopPropagation();
		event.preventDefault();
		
		let menu = this.actionMenus.get(affiliateId);
		
		if (!menu) {
			const menus = this.actionMenuList.toArray();
			const affiliateIndex = this.affiliates.findIndex(a => a.id === affiliateId);
			
			if (affiliateIndex >= 0 && affiliateIndex < menus.length) {
				menu = menus[affiliateIndex];
				this.actionMenus.set(affiliateId, menu);
			}
		}
		
		if (menu) {
			menu.toggle(event);
		} else {
			console.warn(`Menu not found for affiliate ${affiliateId}`);
		}
	}

	setActionMenu(affiliateId: number, menu: TieredMenu): void {
		this.actionMenus.set(affiliateId, menu);
	}

	getActionMenuItems(affiliate: AffiliateMarketer): any[] {
		return [
			{
				label: 'Edit',
				icon: 'pi pi-pencil',
				command: () => {
					this.editAffiliate(affiliate);
				},
			},
			{
				separator: true,
			},
			{
				label: 'Reset Password',
				icon: 'pi pi-key',
				command: () => {
					this.resetPassword(affiliate);
				},
			},
			{
				label: 'Delete',
				icon: 'pi pi-trash',
				command: () => {
					this.deleteAffiliate(affiliate);
				},
			},
		];
	}

	loadAffiliates() {
		this.loading = true;
		this.affiliateService.getAllAffiliateMarketers().subscribe({
			next: (data) => {
				// Ensure data is always an array
				this.affiliates = Array.isArray(data) ? data : [];
				this.totalRecords = this.affiliates.length;
				this.loading = false;
				this.cdr.markForCheck();
				setTimeout(() => this.updateMenuReferences(), 200);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load affiliate marketers',
				});
				this.affiliates = [];
				this.totalRecords = 0;
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onPageChange(event: any): void {
		this.first = event.first;
		this.rows = event.rows;
		this.totalRecords = this.affiliates.length;
	}

	onFilterChange() {
		if (this.affiliateTable) {
			if (this.statusFilter !== null) {
				this.affiliateTable.filter(this.statusFilter, 'isActive', 'equals');
			} else {
				this.affiliateTable.filter(null, 'isActive', 'equals');
			}
		}
	}

	clearFilters() {
		this.globalFilter = '';
		this.statusFilter = null;
		if (this.affiliateTable) {
			this.affiliateTable.clear();
			this.affiliateTable.reset();
		}
	}

	openNewAffiliate() {
		const ref = this.dialogService.open(AdminAffiliateMarketerFormComponent, {
			header: 'Create New Affiliate Marketer',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		if (ref) {
			ref.onClose.subscribe((success: boolean) => {
				if (success) {
					this.loadAffiliates();
				}
			});
		}
	}

	editAffiliate(affiliate: AffiliateMarketer) {
		const ref = this.dialogService.open(AdminAffiliateMarketerFormComponent, {
			header: 'Edit Affiliate Marketer',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { affiliate },
		});

		if (ref) {
			ref.onClose.subscribe((success: boolean) => {
				if (success) {
					this.loadAffiliates();
				}
			});
		}
	}

	resetPassword(affiliate: AffiliateMarketer) {
		const ref = this.dialogService.open(AdminResetAffiliatePasswordComponent, {
			header: 'Reset Password',
			width: '90%',
			style: { 'max-width': '500px' },
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { affiliate },
		});

		if (ref) {
			ref.onClose.subscribe((success: boolean) => {
				if (success) {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Password reset successfully',
					});
				}
			});
		}
	}

	deleteAffiliate(affiliate: AffiliateMarketer) {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete affiliate marketer "${affiliate.name}"? This action cannot be undone.`,
			header: 'Delete Affiliate Marketer',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.affiliateService.deleteAffiliateMarketer(affiliate.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Affiliate marketer deleted successfully',
						});
						this.loadAffiliates();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete affiliate marketer',
						});
					},
				});
			},
		});
	}

	formatCurrency(amount: number): string {
		return `Nu. ${amount.toFixed(2)}`;
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

	getStatusClass(isActive: boolean): string {
		return isActive
			? 'text-xs rounded-full px-2 py-0.5 font-medium bg-green-50 text-green-700 dark:bg-green-500 dark:bg-opacity-15 dark:text-green-500'
			: 'text-xs rounded-full px-2 py-0.5 font-medium bg-red-50 text-red-700 dark:bg-red-500 dark:bg-opacity-15 dark:text-red-500';
	}

	onStatusFilterChange(event: any): void {
		this.statusFilter = event.value;
		if (this.affiliateTable) {
			if (event.value !== null) {
				this.affiliateTable.filter(event.value, 'isActive', 'equals');
			} else {
				this.affiliateTable.filter(null, 'isActive', 'equals');
			}
		}
	}
}

