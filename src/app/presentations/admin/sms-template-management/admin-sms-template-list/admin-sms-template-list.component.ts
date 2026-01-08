import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SmsTemplateService } from '../../../../core/dataservice/sms-template/sms-template.service';
import {
	SmsTemplate,
	SmsTriggerEvent,
	OrderType,
	SmsTemplateQueryDto,
} from '../../../../core/dataservice/sms-template/sms-template.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminSmsTemplateCreateComponent } from '../admin-sms-template-create/admin-sms-template-create.component';
import { Table } from 'primeng/table';

@Component({
	selector: 'app-admin-sms-template-list',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-sms-template-list.component.html',
	styleUrls: ['./admin-sms-template-list.component.scss'],
})
export class AdminSmsTemplateListComponent implements OnInit {
	@ViewChild('templateTable') templateTable!: Table;

	templates: SmsTemplate[] = [];
	selectedTemplates: SmsTemplate[] = [];
	loading: boolean = false;
	globalFilter: string = '';

	// Filters
	triggerEventFilter: SmsTriggerEvent | null = null;
	orderTypeFilter: OrderType | null = null;
	isActiveFilter: boolean | null = null;

	// Filter options
	triggerEventOptions: { label: string; value: SmsTriggerEvent | null }[] = [];
	orderTypeOptions = [
		{ label: 'All Types', value: null },
		{ label: 'Counter', value: OrderType.COUNTER },
		{ label: 'Online', value: OrderType.ONLINE },
	];

	activeStatusOptions = [
		{ label: 'All', value: null },
		{ label: 'Active', value: true },
		{ label: 'Inactive', value: false },
	];

	// Pagination
	first: number = 0;
	rows: number = 7;
	totalRecords: number = 0;

	SmsTriggerEvent = SmsTriggerEvent;
	OrderType = OrderType;

	constructor(
		private smsTemplateService: SmsTemplateService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadTriggerEvents();
		this.loadTemplates();
	}

	loadTriggerEvents() {
		this.smsTemplateService.getAvailableTriggers().subscribe({
			next: (triggers) => {
				this.triggerEventOptions = [
					{ label: 'All Events', value: null },
					...triggers.map((t) => ({
						label: `${t.value} - ${t.description}`,
						value: t.value,
					})),
				];
			},
			error: () => {
				// Fallback to enum values if API fails
				this.triggerEventOptions = [
					{ label: 'All Events', value: null },
					...Object.values(SmsTriggerEvent).map((value) => ({
						label: value,
						value: value,
					})),
				];
			},
		});
	}

	loadTemplates() {
		this.loading = true;
		const query: SmsTemplateQueryDto = {};
		if (this.triggerEventFilter) {
			query.triggerEvent = this.triggerEventFilter;
		}
		if (this.orderTypeFilter) {
			query.orderType = this.orderTypeFilter;
		}
		if (this.isActiveFilter !== null) {
			query.isActive = this.isActiveFilter;
		}

		this.smsTemplateService.getTemplates(query).subscribe({
			next: (data) => {
				this.templates = data;
				this.totalRecords = data.length;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load SMS templates',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onPageChange(event: any): void {
		this.first = event.first;
		this.rows = event.rows;
		this.totalRecords = this.templates.length;
	}

	onFilterChange() {
		this.loadTemplates();
	}

	clearFilters() {
		this.globalFilter = '';
		this.triggerEventFilter = null;
		this.orderTypeFilter = null;
		this.isActiveFilter = null;
		if (this.templateTable) {
			this.templateTable.clear();
			this.templateTable.reset();
		}
		this.loadTemplates();
	}

	openNewTemplate() {
		const ref = this.dialogService.open(AdminSmsTemplateCreateComponent, {
			header: 'Create SMS Template',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadTemplates();
			}
		});
	}

	editTemplate(template: SmsTemplate) {
		const ref = this.dialogService.open(AdminSmsTemplateCreateComponent, {
			header: 'Edit SMS Template',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { template },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadTemplates();
			}
		});
	}

	deleteTemplate(template: SmsTemplate) {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete template "${template.name}"?`,
			header: 'Delete Template',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.smsTemplateService.deleteTemplate(template.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Template deleted successfully',
						});
						this.loadTemplates();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete template',
						});
					},
				});
			},
		});
	}

	toggleActive(template: SmsTemplate) {
		const updateData = {
			isActive: !template.isActive,
		};

		this.smsTemplateService.updateTemplate(template.id, updateData).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: `Template ${updateData.isActive ? 'activated' : 'deactivated'} successfully`,
				});
				this.loadTemplates();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to update template',
				});
			},
		});
	}

	getTriggerEventLabel(event: SmsTriggerEvent): string {
		const trigger = this.triggerEventOptions.find((opt) => opt.value === event);
		return trigger?.label || event;
	}

	getOrderTypeLabel(orderType: OrderType | null): string {
		if (!orderType) return 'Both';
		return orderType === OrderType.COUNTER ? 'Counter' : 'Online';
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

	onStatusFilterChange(event: any): void {
		this.isActiveFilter = event.value;
		if (this.templateTable) {
			if (event.value !== null) {
				this.templateTable.filter(event.value, 'isActive', 'equals');
			} else {
				this.templateTable.filter(null, 'isActive', 'equals');
			}
		}
	}
}

