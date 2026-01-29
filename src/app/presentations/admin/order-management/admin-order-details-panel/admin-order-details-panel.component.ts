import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { Order } from '../../../../core/dataservice/order/order.interface';
import { FulfillmentStatus, FulfillmentType, PaymentStatus } from '../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-order-details-panel',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-order-details-panel.component.html',
	styleUrls: ['./admin-order-details-panel.component.scss'],
})
export class AdminOrderDetailsPanelComponent implements OnInit, OnChanges {
	@Input() order: Order | null = null;
	/** If set, fetches full order by id and uses it instead of @Input() order. */
	@Input() orderId?: number;

	@Output() confirmOrder = new EventEmitter<Order>();
	@Output() markConfirmed = new EventEmitter<Order>();
	@Output() recordPayment = new EventEmitter<Order>();
	@Output() shipOrder = new EventEmitter<Order>();
	@Output() deliverOrder = new EventEmitter<Order>();
	@Output() markCollected = new EventEmitter<Order>();
	@Output() updateDeliveryDetails = new EventEmitter<Order>();
	@Output() openCancelDialog = new EventEmitter<Order>();
	@Output() viewInvoice = new EventEmitter<Order>();
	@Output() viewDetails = new EventEmitter<Order>();

	displayOrder: Order | null = null;
	loading = false;
	FulfillmentStatus = FulfillmentStatus;
	FulfillmentType = FulfillmentType;
	PaymentStatus = PaymentStatus;

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.applyInputs();
	}

	ngOnChanges(ch: SimpleChanges) {
		if (ch['order'] || ch['orderId']) this.applyInputs();
	}

	private applyInputs() {
		if (this.orderId != null) {
			this.displayOrder = null;
			this.loadOrder(this.orderId);
		} else if (this.order) {
			this.displayOrder = this.order;
			this.loading = false;
		} else {
			this.displayOrder = null;
			this.loading = false;
		}
		this.cdr.markForCheck();
	}

	loadOrder(id: number) {
		this.loading = true;
		this.orderService.getOrderById(id).subscribe({
			next: (data) => {
				this.displayOrder = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load order' });
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	getStatusSeverity(status: FulfillmentStatus): string {
		switch (status) {
			case FulfillmentStatus.PLACED: return 'secondary';
			case FulfillmentStatus.CONFIRMED: return 'info';
			case FulfillmentStatus.PROCESSING: return 'warning';
			case FulfillmentStatus.SHIPPING: return 'info';
			case FulfillmentStatus.DELIVERED: return 'success';
			case FulfillmentStatus.CANCELED: return 'danger';
			default: return 'secondary';
		}
	}

	getPaymentMethodLabel(method?: PaymentMethod | null): string {
		if (!method) return 'Not Paid';
		switch (method) {
			case 'CASH': return 'Cash';
			case 'MBOB': return 'MBOB';
			case 'BDB_EPAY': return 'BDB EPay';
			case 'TPAY': return 'TPay';
			case 'BNB_MPAY': return 'BNB MPay';
			case 'ZPSS': return 'ZPSS';
			default: return String(method);
		}
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)}`;
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	// ——— Action visibility (based on fulfillment + payment). Use dummy emit for now. ———
	canConfirmOrder(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return o.fulfillmentStatus === FulfillmentStatus.PLACED && (o.paymentStatus === PaymentStatus.PENDING || o.paymentStatus === PaymentStatus.PARTIAL);
	}
	/** PLACED → CONFIRMED, confirmedAt set; payment unchanged. Use POST /orders/:id/mark-confirmed. */
	canMarkConfirmed(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return o.fulfillmentStatus === FulfillmentStatus.PLACED;
	}
	canRecordPayment(): boolean {
		const o = this.displayOrder; if (!o) return false;
		const unpaid = o.paymentStatus === PaymentStatus.PENDING || o.paymentStatus === PaymentStatus.PARTIAL;
		return (([FulfillmentStatus.PLACED, FulfillmentStatus.CONFIRMED, FulfillmentStatus.PROCESSING].includes(o.fulfillmentStatus) && unpaid))
			|| (o.fulfillmentStatus === FulfillmentStatus.DELIVERED && unpaid);
	}
	canShip(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return o.fulfillmentType === FulfillmentType.DELIVERY && o.fulfillmentStatus === FulfillmentStatus.CONFIRMED;
	}
	canMarkDelivered(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return o.fulfillmentType === FulfillmentType.DELIVERY && o.fulfillmentStatus === FulfillmentStatus.SHIPPING;
	}
	canMarkCollected(): boolean {
		const o = this.displayOrder; if (!o) return false;
		const fs = o.fulfillmentStatus;
		const pt = o.fulfillmentType;
		return (pt === FulfillmentType.PICKUP || pt === FulfillmentType.INSTORE) && (fs === FulfillmentStatus.CONFIRMED || fs === FulfillmentStatus.PROCESSING);
	}
	canUpdateDeliveryDetails(): boolean {
		const o = this.displayOrder; if (!o) return false;
		if (o.fulfillmentType !== FulfillmentType.DELIVERY) return false;
		const fs = o.fulfillmentStatus;
		return [FulfillmentStatus.CONFIRMED, FulfillmentStatus.PROCESSING, FulfillmentStatus.SHIPPING].includes(fs);
	}
	canCancel(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return o.fulfillmentStatus !== FulfillmentStatus.DELIVERED && o.fulfillmentStatus !== FulfillmentStatus.CANCELED;
	}

	onConfirmOrder(): void { if (this.displayOrder) this.confirmOrder.emit(this.displayOrder); }
	onMarkConfirmed(): void { if (this.displayOrder) this.markConfirmed.emit(this.displayOrder); }
	onRecordPayment(): void { if (this.displayOrder) this.recordPayment.emit(this.displayOrder); }
	onShipOrder(): void { if (this.displayOrder) this.shipOrder.emit(this.displayOrder); }
	onDeliverOrder(): void { if (this.displayOrder) this.deliverOrder.emit(this.displayOrder); }
	onMarkCollected(): void { if (this.displayOrder) this.markCollected.emit(this.displayOrder); }
	onUpdateDeliveryDetails(): void { if (this.displayOrder) this.updateDeliveryDetails.emit(this.displayOrder); }
	onOpenCancelDialog(): void { if (this.displayOrder) this.openCancelDialog.emit(this.displayOrder); }
	onViewInvoice(): void { if (this.displayOrder) this.viewInvoice.emit(this.displayOrder); }
	onViewDetails(): void { if (this.displayOrder) this.viewDetails.emit(this.displayOrder); }
}
