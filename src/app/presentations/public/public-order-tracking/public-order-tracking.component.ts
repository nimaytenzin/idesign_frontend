import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/dataservice/order/order.service';
import {
	Order,
	TrackOrderDto,
	FulfillmentStatus,
	PaymentStatus,
	OrderTimelineEvent,
} from '../../../core/dataservice/order/order.interface';
import { PaymentMethod } from '../../../core/dataservice/account/account.interface';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'app-public-order-tracking',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		CardModule,
		InputTextModule,
		ButtonModule,
		ProgressSpinnerModule,
		TagModule,
		ToastModule,
	],
	providers: [MessageService],
	templateUrl: './public-order-tracking.component.html',
	styleUrls: ['./public-order-tracking.component.scss'],
})
export class PublicOrderTrackingComponent {
	FulfillmentStatus = FulfillmentStatus; // Expose enum to template
	PaymentStatus = PaymentStatus; // Expose enum to template
	
	trackingForm: TrackOrderDto = {
		orderNumber: '',
		phoneNumber: '',
	};
	trackingResults: Order | Order[] | null = null;
	trackingLoading = false;
	showTrackingResults = false;

	// Timeline data
	orderTimelines: Map<number, OrderTimelineEvent[]> = new Map();
	timelineLoading: Map<number, boolean> = new Map();
	expandedOrders: Set<number> = new Set();

	constructor(
		private router: Router,
		private orderService: OrderService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	trackOrder(): void {
		// Validate that at least one field is provided
		if (!this.trackingForm.orderNumber && !this.trackingForm.phoneNumber) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please provide either an order number or phone number',
			});
			return;
		}

		// Clear previous results
		this.trackingResults = null;
		this.trackingLoading = true;
		this.showTrackingResults = false;

		this.orderService.trackOrder(this.trackingForm).subscribe({
			next: (results) => {
				this.trackingResults = results;
				this.showTrackingResults = true;
				this.trackingLoading = false;

				const isArray = Array.isArray(results);
				const count = isArray ? results.length : 1;
				this.messageService.add({
					severity: 'success',
					summary: 'Order Found',
					detail: `Found ${count} order${count > 1 ? 's' : ''}`,
				});

				// Load timelines for all found orders
				if (isArray) {
					results.forEach(order => {
						if (order.id) {
							this.loadOrderTimeline(order.id);
						}
					});
				} else if (results.id) {
					this.loadOrderTimeline(results.id);
				}
			},
			error: (error) => {
				this.trackingLoading = false;
				this.showTrackingResults = false;
				const errorMessage =
					error.error?.message ||
					error.message ||
					'Failed to track order. Please check your information and try again.';
				this.messageService.add({
					severity: 'error',
					summary: 'Tracking Failed',
					detail: errorMessage,
				});
			},
		});
	}

	isArray(value: any): value is Order[] {
		return Array.isArray(value);
	}

	getSingleOrder(): Order | null {
		if (this.trackingResults && !this.isArray(this.trackingResults)) {
			return this.trackingResults;
		}
		return null;
	}

	getOrdersArray(): Order[] | null {
		if (this.trackingResults && this.isArray(this.trackingResults)) {
			return this.trackingResults;
		}
		return null;
	}

	getStatusClass(status: FulfillmentStatus): string {
		const statusClasses: { [key in FulfillmentStatus]: string } = {
			PLACED: 'bg-slate-100 text-slate-800',
			CONFIRMED: 'bg-teal-100 text-teal-800',
			PROCESSING: 'bg-amber-100 text-amber-800',
			SHIPPING: 'bg-teal-100 text-teal-800',
			DELIVERED: 'bg-green-100 text-green-800',
			CANCELED: 'bg-red-100 text-red-800',
		};
		return statusClasses[status] || 'bg-gray-100 text-gray-800';
	}

	getStatusSeverity(status: FulfillmentStatus): 'success' | 'info' | 'warning' | 'danger' | null {
		const severityMap: { [key in FulfillmentStatus]: 'success' | 'info' | 'warning' | 'danger' | null } = {
			PLACED: 'warning',
			CONFIRMED: 'info',
			PROCESSING: 'warning',
			SHIPPING: 'info',
			DELIVERED: 'success',
			CANCELED: 'danger',
		};
		return severityMap[status] || null;
	}

	formatDate(date: Date | string): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	formatCurrency(amount: number): string {
		return `Nu. ${amount.toFixed(2)}`;
	}

	formatPrice(price: number): string {
		return `Nu ${new Intl.NumberFormat('en-BT', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)}`;
	}

	getPaymentMethodLabel(method?: PaymentMethod): string {
		if (!method) return 'Not paid';
		const labels: { [key in PaymentMethod]: string } = {
			CASH: 'Cash on Delivery',
			MBOB: 'MBOB',
			BDB_EPAY: 'BDB EPay',
			TPAY: 'TPay',
			BNB_MPAY: 'BNB MPay',
			ZPSS: 'ZPSS',
		};
		return labels[method] || method;
	}

	getPaymentStatusSeverity(status: PaymentStatus): 'success' | 'warning' | 'danger' | null {
		const severityMap: { [key in PaymentStatus]: 'success' | 'warning' | 'danger' | null } = {
			PENDING: 'warning',
			PAID: 'success',
			FAILED: 'danger',
		};
		return severityMap[status] || null;
	}

	getPaymentStatusClass(status: PaymentStatus): string {
		const statusClasses: { [key in PaymentStatus]: string } = {
			PENDING: 'bg-yellow-100 text-yellow-800',
			PAID: 'bg-green-100 text-green-800',
			FAILED: 'bg-red-100 text-red-800',
		};
		return statusClasses[status] || 'bg-gray-100 text-gray-800';
	}

	resetTracking(): void {
		this.trackingForm = {
			orderNumber: '',
			phoneNumber: '',
		};
		this.trackingResults = null;
		this.showTrackingResults = false;
		this.orderTimelines.clear();
		this.timelineLoading.clear();
		this.expandedOrders.clear();
	}

	// Timeline Methods
	loadOrderTimeline(orderId: number): void {
		if (this.timelineLoading.get(orderId)) {
			return; // Already loading
		}

		this.timelineLoading.set(orderId, true);
		this.orderService.getOrderTimeline(orderId).subscribe({
			next: (events) => {
				// Sort chronologically (oldest first)
				const sortedEvents = events.sort((a, b) => {
					return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
				});
				this.orderTimelines.set(orderId, sortedEvents);
				this.timelineLoading.set(orderId, false);
				this.cdr.markForCheck();
			},
			error: () => {
				this.timelineLoading.set(orderId, false);
				this.cdr.markForCheck();
			},
		});
	}

	getOrderTimeline(orderId: number): OrderTimelineEvent[] {
		return this.orderTimelines.get(orderId) || [];
	}

	isTimelineLoading(orderId: number): boolean {
		return this.timelineLoading.get(orderId) || false;
	}

	toggleTimeline(orderId: number): void {
		if (this.expandedOrders.has(orderId)) {
			this.expandedOrders.delete(orderId);
		} else {
			this.expandedOrders.add(orderId);
			// Load timeline if not already loaded
			if (!this.orderTimelines.has(orderId)) {
				this.loadOrderTimeline(orderId);
			}
		}
	}

	isTimelineExpanded(orderId: number): boolean {
		return this.expandedOrders.has(orderId);
	}

	getStatusTypeSeverity(statusType: string): string {
		switch (statusType) {
			case 'FULFILLMENT':
				return 'info';
			case 'PAYMENT':
				return 'success';
			case 'SYSTEM':
				return 'secondary';
			case 'COMMUNICATION':
				return 'warning';
			default:
				return 'secondary';
		}
	}

	getStatusTypeIcon(statusType: string): string {
		switch (statusType) {
			case 'FULFILLMENT':
				return 'pi pi-box';
			case 'PAYMENT':
				return 'pi pi-money-bill';
			case 'SYSTEM':
				return 'pi pi-cog';
			case 'COMMUNICATION':
				return 'pi pi-send';
			default:
				return 'pi pi-circle';
		}
	}

	formatTimelineDate(date: Date | string): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(d);
	}

	hasMetadata(event: OrderTimelineEvent): boolean {
		return event.metadata && Object.keys(event.metadata).length > 0;
	}

	getMetadataDisplay(event: OrderTimelineEvent): string {
		if (!this.hasMetadata(event)) return '';
		
		const metadata = event.metadata;
		const parts: string[] = [];
		
		if (metadata.driverName) parts.push(`Driver: ${metadata.driverName}`);
		if (metadata.driverPhone) parts.push(`Phone: ${metadata.driverPhone}`);
		if (metadata.vehicleNumber) parts.push(`Vehicle: ${metadata.vehicleNumber}`);
		if (metadata.smsSent !== undefined) parts.push(`SMS: ${metadata.smsSent ? 'Sent' : 'Not sent'}`);
		if (metadata.transactionId) parts.push(`Txn ID: ${metadata.transactionId}`);
		if (metadata.feedbackLink) parts.push(`Feedback: ${metadata.feedbackLink}`);
		
		return parts.join(', ');
	}

}	

