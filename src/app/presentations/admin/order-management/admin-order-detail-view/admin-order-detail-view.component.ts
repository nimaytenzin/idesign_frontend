import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import {
	Order,
	FulfillmentStatus,
	PaymentStatus,
	OrderType,
	OrderTimelineEvent,
	UpdateFulfillmentStatusDto,
	UpdatePaymentStatusDto,
	DeliverOrderDto,
	CancelOrderDto,
} from '../../../../core/dataservice/order/order.interface';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminOrderTimelineComponent } from '../admin-order-timeline/admin-order-timeline.component';

@Component({
	selector: 'app-admin-order-detail-view',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules, AdminOrderTimelineComponent],
	providers: [MessageService],
	templateUrl: './admin-order-detail-view.component.html',
	styleUrls: ['./admin-order-detail-view.component.scss'],
})
export class AdminOrderDetailViewComponent implements OnInit, OnChanges {
	@Input() order!: Order;
	@Input() onStatusUpdate?: () => void;

	timelineEvents: OrderTimelineEvent[] = [];
	loadingTimeline: boolean = false;

	FulfillmentStatus = FulfillmentStatus;
	PaymentStatus = PaymentStatus;
	OrderType = OrderType;

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		if (this.order) {
			this.loadTimeline();
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['order'] && this.order) {
			this.loadTimeline();
		}
	}

	loadTimeline() {
		if (!this.order?.id) return;
		this.loadingTimeline = true;
		this.orderService.getOrderTimeline(this.order.id).subscribe({
			next: (events) => {
				this.timelineEvents = events.sort((a, b) => {
					return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
				});
				this.loadingTimeline = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.loadingTimeline = false;
				this.cdr.markForCheck();
			},
		});
	}

	getStatusSeverity(status: FulfillmentStatus): string {
		switch (status) {
			case FulfillmentStatus.PLACED:
				return 'secondary';
			case FulfillmentStatus.CONFIRMED:
				return 'info';
			case FulfillmentStatus.PROCESSING:
				return 'warning';
			case FulfillmentStatus.PACKAGING:
				return 'warning';
			case FulfillmentStatus.SHIPPED:
				return 'info';
			case FulfillmentStatus.DELIVERED:
				return 'success';
			case FulfillmentStatus.CANCELED:
				return 'danger';
			default:
				return 'secondary';
		}
	}

	getPaymentStatusSeverity(status: PaymentStatus): string {
		switch (status) {
			case PaymentStatus.PENDING:
				return 'warning';
			case PaymentStatus.PAID:
				return 'success';
			case PaymentStatus.FAILED:
				return 'danger';
			default:
				return 'secondary';
		}
	}

	getPaymentMethodLabel(method?: PaymentMethod | null): string {
		if (!method) return 'Not Paid';
		switch (method) {
			case 'CASH':
				return 'Cash on Delivery';
			case 'MBOB':
				return 'MBOB';
			case 'BDB_EPAY':
				return 'BDB EPay';
			case 'TPAY':
				return 'TPay';
			case 'BNB_MPAY':
				return 'BNB MPay';
			case 'ZPSS':
				return 'ZPSS';
			default:
				return method;
		}
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	getCurrentPaymentEvent(): OrderTimelineEvent | null {
		const paymentEvents = this.timelineEvents.filter((e) => e.statusType === 'PAYMENT');
		return paymentEvents.length > 0 ? paymentEvents[paymentEvents.length - 1] : null;
	}

	getCurrentFulfillmentEvent(): OrderTimelineEvent | null {
		const fulfillmentEvents = this.timelineEvents.filter((e) => e.statusType === 'FULFILLMENT');
		return fulfillmentEvents.length > 0 ? fulfillmentEvents[fulfillmentEvents.length - 1] : null;
	}
}

