import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { Order, CancelOrderDto } from '../../../../core/dataservice/order/order.interface';
import { FulfillmentStatus, FulfillmentType, PaymentStatus } from '../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminPlaceOrderComponent } from '../admin-place-order/admin-place-order.component';
import { AdminViewInvoiceComponent } from '../admin-view-invoice/admin-view-invoice.component';
import { AdminViewOrderComponent } from '../admin-view-order/admin-view-order.component';
import { AdminShipOrderComponent } from '../admin-ship-order/admin-ship-order.component';
import { AdminDeliverOrderComponent } from '../admin-deliver-order/admin-deliver-order.component';

/** Counter order notification type: fulfillment + payment status. */
export type CounterOrderNotificationType =
	| 'InstorePaid'   // Collected and paid in store
	| 'InstorePending' // Item taken from store but not paid
	| 'PickupPaid'    // Will come to pickup at store later
	| 'PickupPending' // Will come to pickup at store later
	| 'DeliveryPaid'
	| 'DeliveryPending';

@Component({
	selector: 'app-admin-order-details-panel',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, DialogService],
	templateUrl: './admin-order-details-panel.component.html',
	styleUrls: ['./admin-order-details-panel.component.scss'],
})
export class AdminOrderDetailsPanelComponent implements OnInit, OnChanges {
	@Input() order: Order | null = null;
	/** If set, fetches full order by id and uses it instead of @Input() order. */
	@Input() orderId?: number;
	/** Emitted when an order was updated (e.g. after mark confirmed, ship, deliver); parent should set selectedOrder. */
	@Output() orderUpdated = new EventEmitter<Order | null>();
	/** Emitted when lists should be refreshed (e.g. after dialog close or API success). */
	@Output() refreshRequested = new EventEmitter<void>();

	displayOrder: Order | null = null;
	loading = false;
	FulfillmentStatus = FulfillmentStatus;
	FulfillmentType = FulfillmentType;
	PaymentStatus = PaymentStatus;

	showCancelDialog = false;
	selectedOrderForCancel: Order | null = null;
	actionNotes = '';

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		private dialogService: DialogService,
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

	/** Severity for p-tag (Payment): success=Paid, warning=Pending, danger=Failed. */
	getPaymentSeverity(paymentStatus: PaymentStatus): string {
		switch (paymentStatus) {
			case PaymentStatus.PAID: return 'success';
			case PaymentStatus.PENDING: return 'warning';
			case PaymentStatus.FAILED: return 'danger';
			default: return 'secondary';
		}
	}

	/** Severity for p-tag (Fulfillment); delegates to getStatusSeverity. */
	getFulfillmentSeverity(fulfillmentStatus: FulfillmentStatus): string {
		return this.getStatusSeverity(fulfillmentStatus);
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

	/** Order type for notification: fulfillment + payment status. */
	getOrderNotificationType(order: Order): CounterOrderNotificationType {
		const ft = order.fulfillmentType;
		const paid = order.paymentStatus === PaymentStatus.PAID;

		if (ft === FulfillmentType.INSTORE) return paid ? 'InstorePaid' : 'InstorePending';
		if (ft === FulfillmentType.PICKUP) return paid ? 'PickupPaid' : 'PickupPending';
		if (ft === FulfillmentType.DELIVERY) return paid ? 'DeliveryPaid' : 'DeliveryPending';

		return 'DeliveryPending';
	}

	/** Current order notification type (for template). */
	get notificationType(): CounterOrderNotificationType | null {
		return this.displayOrder ? this.getOrderNotificationType(this.displayOrder) : null;
	}

	// ——— Action visibility (based on CounterOrderNotificationType + fulfillment status). ———
	/** PLACED → CONFIRMED, confirmedAt set; payment unchanged. */
	canMarkConfirmed(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return o.fulfillmentStatus === FulfillmentStatus.PLACED;
	}
	/** Show "Ship Order" for delivery when order is confirmed (ready to ship). */
	canShip(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return this.getOrderNotificationType(o).startsWith('Delivery') && o.fulfillmentStatus === FulfillmentStatus.CONFIRMED;
	}
	/** Show "Mark Delivered" for delivery when order is shipping. */
	canMarkDelivered(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return this.getOrderNotificationType(o).startsWith('Delivery') && o.fulfillmentStatus === FulfillmentStatus.SHIPPING;
	}
	/** Show "Mark as Picked Up" for in-store / pickup when ready (CONFIRMED or PROCESSING). */
	canMarkCollected(): boolean {
		const o = this.displayOrder; if (!o) return false;
		const nt = this.getOrderNotificationType(o);
		const isInstoreOrPickup = nt.startsWith('Instore') || nt.startsWith('Pickup');
		const fs = o.fulfillmentStatus;
		return isInstoreOrPickup && (fs === FulfillmentStatus.CONFIRMED || fs === FulfillmentStatus.PROCESSING);
	}
	canUpdateDeliveryDetails(): boolean {
		const o = this.displayOrder; if (!o) return false;
		if (!this.getOrderNotificationType(o).startsWith('Delivery')) return false;
		const fs = o.fulfillmentStatus;
		return [FulfillmentStatus.CONFIRMED, FulfillmentStatus.PROCESSING, FulfillmentStatus.SHIPPING].includes(fs);
	}
	/** Show single "Ship Order" button when can ship (CONFIRMED) or can update delivery details (CONFIRMED/PROCESSING/SHIPPING). */
	canShipOrUpdateDelivery(): boolean {
		return this.canShip() || this.canUpdateDeliveryDetails();
	}
	canCancel(): boolean {
		const o = this.displayOrder; if (!o) return false;
		return o.fulfillmentStatus !== FulfillmentStatus.DELIVERED && o.fulfillmentStatus !== FulfillmentStatus.CANCELED;
	}

	/** Label for collect action: "Mark as Picked Up" for pickup, "Mark as Delivered" for in-store. */
	getMarkCollectedLabel(): string {
		if (!this.displayOrder) return 'Mark Collected';
		const nt = this.notificationType;
		if (nt?.startsWith('Instore')) return 'Mark as Delivered';
		if (nt?.startsWith('Pickup')) return 'Mark as Picked Up';
		return 'Mark Collected';
	}

	onMarkConfirmed(): void { if (this.displayOrder) this.markConfirmed(this.displayOrder); }
	onShipOrder(): void { if (this.displayOrder) this.shipOrder(this.displayOrder); }
	onDeliverOrder(): void { if (this.displayOrder) this.deliverOrder(this.displayOrder); }
	onMarkCollected(): void { if (this.displayOrder) this.markCollected(this.displayOrder); }
	onUpdateDeliveryDetails(): void { if (this.displayOrder) this.updateDeliveryDetails(this.displayOrder); }
	/** Ship order (when CONFIRMED) or update delivery details (when PROCESSING/SHIPPING). */
	onShipOrderOrUpdate(): void {
		if (!this.displayOrder) return;
		if (this.canShip()) this.shipOrder(this.displayOrder);
		else this.updateDeliveryDetails(this.displayOrder);
	}
	onOpenCancelDialog(): void { if (this.displayOrder) this.openCancelDialog(this.displayOrder); }
	onViewInvoice(): void { if (this.displayOrder) this.viewInvoice(this.displayOrder); }
	onViewDetails(): void { if (this.displayOrder) this.viewOrderDetails(this.displayOrder); }

	// ——— Actions (dialogs + API); emit orderUpdated / refreshRequested for parent. ———
	openPlaceOrderDialog(): void {
		const ref = this.dialogService.open(AdminPlaceOrderComponent, {
			header: 'Place New Order',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: false,
		});
		ref.onClose.subscribe(() => this.refreshRequested.emit());
	}

	deliverOrder(order: Order): void {
		const ref = this.dialogService.open(AdminDeliverOrderComponent, {
			header: `Mark as Delivered - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: { order, orderId: order.id },
		});
		ref.onClose.subscribe((deliveredOrder: Order) => {
			if (deliveredOrder) {
				this.displayOrder = deliveredOrder;
				this.orderUpdated.emit(deliveredOrder);
				this.refreshRequested.emit();
				this.cdr.markForCheck();
			}
		});
	}

	markCollected(order: Order): void {
		this.orderService.markOrderAsCollected(order.id).subscribe({
			next: (res) => {
				this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order marked as collected' });
				this.displayOrder = res;
				this.orderUpdated.emit(res);
				this.refreshRequested.emit();
				this.cdr.markForCheck();
			},
			error: (err) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to mark as collected' });
			},
		});
	}

	markConfirmed(order: Order): void {
		this.orderService.markOrderAsConfirmed(order.id).subscribe({
			next: (res) => {
				this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order marked as confirmed' });
				this.displayOrder = res;
				this.orderUpdated.emit(res);
				this.refreshRequested.emit();
				this.cdr.markForCheck();
			},
			error: (err) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to mark as confirmed' });
			},
		});
	}

	openCancelDialog(order: Order): void {
		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED) {
			this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Cannot cancel delivered orders' });
			return;
		}
		this.selectedOrderForCancel = order;
		this.actionNotes = '';
		this.showCancelDialog = true;
		this.cdr.markForCheck();
	}

	cancelOrder(): void {
		if (!this.selectedOrderForCancel) return;
		const cancelData: CancelOrderDto = {
			reason: this.actionNotes?.trim() || undefined,
			internalNotes: this.actionNotes?.trim() || undefined,
		};
		this.orderService.cancelOrder(this.selectedOrderForCancel.id, cancelData).subscribe({
			next: () => {
				this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order cancelled successfully' });
				this.showCancelDialog = false;
				this.selectedOrderForCancel = null;
				this.displayOrder = null;
				this.orderUpdated.emit(null);
				this.refreshRequested.emit();
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'Failed to cancel order' });
			},
		});
	}

	shipOrder(order: Order): void {
		const ref = this.dialogService.open(AdminShipOrderComponent, {
			header: `Ship Order - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: { order, orderId: order.id },
		});
		ref.onClose.subscribe((shippedOrder: Order) => {
			if (shippedOrder) {
				this.displayOrder = shippedOrder;
				this.orderUpdated.emit(shippedOrder);
				this.refreshRequested.emit();
				this.cdr.markForCheck();
			}
		});
	}

	updateDeliveryDetails(order: Order): void {
		const ref = this.dialogService.open(AdminShipOrderComponent, {
			header: `Update Delivery Details - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: { order, orderId: order.id, mode: 'update' },
		});
		ref.onClose.subscribe((updated: Order) => {
			if (updated) {
				this.displayOrder = updated;
				this.orderUpdated.emit(updated);
				this.refreshRequested.emit();
				this.cdr.markForCheck();
			}
		});
	}

	viewInvoice(order: Order): void {
		this.dialogService.open(AdminViewInvoiceComponent, {
			header: `Invoice - ${order.orderNumber}`,
			width: '80%',
			style: { 'max-width': '1000px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { orderId: order.id, order },
		});
	}

	viewOrderDetails(order: Order): void {
		const ref = this.dialogService.open(AdminViewOrderComponent, {
			header: `Order Details - ${order.orderNumber}`,
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { orderId: order.id, order },
		});
		ref.onClose.subscribe(() => this.refreshRequested.emit());
	}
}
