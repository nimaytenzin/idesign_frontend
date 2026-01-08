import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { OrderTimelineEvent } from '../../../../core/dataservice/order/order.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-order-timeline',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	templateUrl: './admin-order-timeline.component.html',
	styleUrls: ['./admin-order-timeline.component.scss'],
})
export class AdminOrderTimelineComponent implements OnInit {
	@Input() orderId!: number;
	timelineEvents: OrderTimelineEvent[] = [];
	loading: boolean = false;

	constructor(
		private orderService: OrderService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		if (this.orderId) {
			this.loadTimeline();
		}
	}

	loadTimeline() {
		this.loading = true;
		this.orderService.getOrderTimeline(this.orderId).subscribe({
			next: (events) => {
				// Sort chronologically (oldest first) for better timeline visualization
				this.timelineEvents = events.sort((a, b) => {
					return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	getCurrentPaymentStatus(): OrderTimelineEvent | null {
		const paymentEvents = this.timelineEvents.filter(e => e.statusType === 'PAYMENT');
		return paymentEvents.length > 0 ? paymentEvents[paymentEvents.length - 1] : null;
	}

	getCurrentFulfillmentStatus(): OrderTimelineEvent | null {
		const fulfillmentEvents = this.timelineEvents.filter(e => e.statusType === 'FULFILLMENT');
		return fulfillmentEvents.length > 0 ? fulfillmentEvents[fulfillmentEvents.length - 1] : null;
	}

	getPaymentEvents(): OrderTimelineEvent[] {
		return this.timelineEvents.filter(e => e.statusType === 'PAYMENT');
	}

	getFulfillmentEvents(): OrderTimelineEvent[] {
		return this.timelineEvents.filter(e => e.statusType === 'FULFILLMENT');
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

	formatDate(date: Date | string): string {
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
		if (metadata.smsSent) parts.push(`SMS: ${metadata.smsSent ? 'Sent' : 'Not sent'}`);
		
		return parts.join(', ');
	}
}

