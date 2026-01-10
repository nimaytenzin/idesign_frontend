import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SmsTemplateService } from '../../../../core/dataservice/sms-template/sms-template.service';
import {
	SmsTemplate,
	CreateSmsTemplateDto,
	UpdateSmsTemplateDto,
	SmsTriggerEvent,
	TriggerInfo,
	PlaceholderInfo,
	TestSmsTemplateDto,
} from '../../../../core/dataservice/sms-template/sms-template.interface';
import { OrderSource } from '../../../../core/dataservice/order/order.interface';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { Order } from '../../../../core/dataservice/order/order.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-sms-template-create',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-sms-template-create.component.html',
	styleUrls: ['./admin-sms-template-create.component.scss'],
})
export class AdminSmsTemplateCreateComponent implements OnInit {
	template: Partial<SmsTemplate> = {};
	isEditMode: boolean = false;
	submitted: boolean = false;
	loading: boolean = false;
	testLoading: boolean = false;

	// Options
	triggerEventOptions: TriggerInfo[] = [];
	placeholderOptions: PlaceholderInfo[] = [];
	orderTypeOptions = [
		{ label: 'Both (Counter & Online)', value: null },
		{ label: 'Counter', value: OrderSource.COUNTER },
		{ label: 'Online', value: OrderSource.ONLINE },
	];

	// Test template
	testOrderId: number | null = null;
	testRenderedMessage: string | null = null;
	availableOrders: Order[] = [];

	SmsTriggerEvent = SmsTriggerEvent;
	OrderSource = OrderSource;
	placeholderExample = '{{customerName}}, {{orderNumber}}, etc.';

	constructor(
		private smsTemplateService: SmsTemplateService,
		private orderService: OrderService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		// Check if editing existing template
		if (this.config.data?.template) {
			this.template = { ...this.config.data.template };
			this.isEditMode = true;
		} else {
			// Initialize with defaults
			this.template = {
				isActive: true,
				sendCount: 1,
				sendDelay: 0,
				priority: 0,
				orderType: null,
			};
		}
	}

	ngOnInit() {
		this.loadTriggerEvents();
		this.loadPlaceholders();
		this.loadOrders();
	}

	loadTriggerEvents() {
		this.smsTemplateService.getAvailableTriggers().subscribe({
			next: (triggers) => {
				this.triggerEventOptions = triggers;
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load trigger events',
				});
			},
		});
	}

	loadPlaceholders() {
		this.smsTemplateService.getAvailablePlaceholders().subscribe({
			next: (placeholders) => {
				this.placeholderOptions = placeholders;
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load placeholders',
				});
			},
		});
	}

	loadOrders() {
		this.orderService.getOrders().subscribe({
			next: (orders) => {
				this.availableOrders = orders.slice(0, 50); // Limit to 50 most recent
			},
			error: () => {
				// Silently fail - not critical
			},
		});
	}

	insertPlaceholder(placeholder: string) {
		const messageInput = document.getElementById('messageTextarea') as HTMLTextAreaElement;
		if (!messageInput) return;

		const cursorPos = messageInput.selectionStart;
		const placeholderText = `{{${placeholder}}}`;
		const currentValue = this.template.message || '';
		const newMessage =
			currentValue.slice(0, cursorPos) + placeholderText + currentValue.slice(cursorPos);

		this.template.message = newMessage;
		this.cdr.markForCheck();

		// Set cursor position after inserted placeholder
		setTimeout(() => {
			messageInput.focus();
			messageInput.setSelectionRange(
				cursorPos + placeholderText.length,
				cursorPos + placeholderText.length
			);
		}, 0);
	}

	testTemplate() {
		if (!this.template.id || !this.testOrderId) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select an order to test with',
			});
			return;
		}

		this.testLoading = true;
		const testData: TestSmsTemplateDto = {
			orderId: this.testOrderId,
		};

		this.smsTemplateService.testTemplate(this.template.id, testData).subscribe({
			next: (response) => {
				this.testRenderedMessage = response.renderedMessage;
				this.testLoading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to test template',
				});
				this.testLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	saveTemplate() {
		this.submitted = true;

		// Validation
		if (!this.template.name || !this.template.triggerEvent || !this.template.message) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		// Validate sendCount (1-5)
		if (
			this.template.sendCount === undefined ||
			this.template.sendCount < 1 ||
			this.template.sendCount > 5
		) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Send count must be between 1 and 5',
			});
			return;
		}

		// Validate sendDelay (>= 0)
		if (this.template.sendDelay === undefined || this.template.sendDelay < 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Send delay must be 0 or greater',
			});
			return;
		}

		this.loading = true;

		if (this.isEditMode) {
			const updateData: UpdateSmsTemplateDto = {
				name: this.template.name,
				triggerEvent: this.template.triggerEvent,
				message: this.template.message,
				isActive: this.template.isActive,
				sendCount: this.template.sendCount,
				sendDelay: this.template.sendDelay,
				orderType: this.template.orderType,
				priority: this.template.priority,
			};

			this.smsTemplateService.updateTemplate(this.template.id!, updateData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Template updated successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update template',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			const createData: CreateSmsTemplateDto = {
				name: this.template.name!,
				triggerEvent: this.template.triggerEvent!,
				message: this.template.message!,
				isActive: this.template.isActive ?? true,
				sendCount: this.template.sendCount ?? 1,
				sendDelay: this.template.sendDelay ?? 0,
				orderType: this.template.orderType ?? null,
				priority: this.template.priority ?? 0,
			};

			this.smsTemplateService.createTemplate(createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Template created successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create template',
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

	getTriggerEventDescription(event: SmsTriggerEvent): string {
		const trigger = this.triggerEventOptions.find((t) => t.value === event);
		return trigger?.description || '';
	}
}

