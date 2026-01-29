import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { CustomerService } from '../../../../core/dataservice/customer/customer.service';
import { Order, CancelOrderDto } from '../../../../core/dataservice/order/order.interface';
import { Customer } from '../../../../core/dataservice/customer/customer.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminPlaceOrderComponent } from '../admin-place-order/admin-place-order.component';
import { AdminViewInvoiceComponent } from '../admin-view-invoice/admin-view-invoice.component';
import { AdminViewOrderComponent } from '../admin-view-order/admin-view-order.component';
import { AdminConfirmOrderComponent } from '../admin-confirm-order/admin-confirm-order.component';
import { AdminShipOrderComponent } from '../admin-ship-order/admin-ship-order.component';
import { AdminDeliverOrderComponent } from '../admin-deliver-order/admin-deliver-order.component';
import { FulfillmentStatus } from '../../../../core/constants/enums';
import { AdminTabToProcessComponent } from './tabs/admin-tab-to-process/admin-tab-to-process.component';
import { AdminTabToDeliverComponent } from './tabs/admin-tab-to-deliver/admin-tab-to-deliver.component';
import { AdminTabAwaitingPickupComponent } from './tabs/admin-tab-awaiting-pickup/admin-tab-awaiting-pickup.component';
import { AdminTabUnpaidDeliveryComponent } from './tabs/admin-tab-unpaid-delivery/admin-tab-unpaid-delivery.component';
import { AdminTabCompletedComponent } from './tabs/admin-tab-completed/admin-tab-completed.component';
import { AdminTabCancelledComponent } from './tabs/admin-tab-cancelled/admin-tab-cancelled.component';
import { AdminTabToTrackComponent } from './tabs/admin-tab-to-track/admin-tab-to-track.component';
import { AdminOrderDetailsPanelComponent } from '../admin-order-details-panel/admin-order-details-panel.component';

@Component({
	selector: 'app-admin-list-orders',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		PrimeNgModules,
		AdminTabToProcessComponent,
		AdminTabToDeliverComponent,
		AdminTabAwaitingPickupComponent,
		AdminTabUnpaidDeliveryComponent,
		AdminTabCompletedComponent,
		AdminTabCancelledComponent,
		AdminTabToTrackComponent,
		AdminOrderDetailsPanelComponent,
	],
	providers: [MessageService, DialogService, ConfirmationService],
	templateUrl: './admin-list-orders.component.html',
	styleUrls: ['./admin-list-orders.component.scss'],
})
export class AdminListOrdersComponent implements OnInit {
	orders: Order[] = [];
	filteredOrders: Order[] = [];
	loading: boolean = false;

	activePhaseIndex: number = 0;
	phases = [
		{ id: 'to-process', label: 'To Process', isHistory: false },
		{ id: 'to-deliver', label: 'To Deliver', isHistory: false },
		{ id: 'ready-for-pickup', label: 'Awaiting Pickup', isHistory: false },
		{ id: 'to-track', label: 'To Track', isHistory: false },
		{ id: 'unpaid-delivery', label: 'Unpaid Delivery', isHistory: false },
		{ id: 'completed', label: 'Completed', isHistory: true },
		{ id: 'cancelled', label: 'Cancelled', isHistory: true },
	];

	customers: Customer[] = [];

	// Refresh triggers: each tab loads its own data; parent increments to request reload
	toProcessRefreshTrigger = 0;
	toDeliverRefreshTrigger = 0;
	awaitingPickupRefreshTrigger = 0;
	unpaidDeliveryRefreshTrigger = 0;
	toTrackRefreshTrigger = 0;
	completedRefreshTrigger = 0;
	cancelledRefreshTrigger = 0;

	// Cancel dialog
	showCancelDialog: boolean = false;
	selectedOrderForAction: Order | null = null;
	actionNotes: string = '';

	// Inline order details (row click)
	selectedOrder: Order | null = null;

	constructor(
		private orderService: OrderService,
		private customerService: CustomerService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private confirmationService: ConfirmationService,
		public router: Router,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCustomers();
		this.loadOrdersForPhase(this.activePhaseIndex);
	}

	loadCustomers() {
		this.customerService.getCustomers().subscribe({
			next: (data) => {
				this.customers = data;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load customers',
				});
			},
		});
	}

	loadOrdersForPhase(phaseIndex: number) {
		if (phaseIndex < 0 || phaseIndex >= this.phases.length) return;
		const id = this.phases[phaseIndex].id;
		if (id === 'to-process') { this.toProcessRefreshTrigger++; return; }
		if (id === 'to-deliver') { this.toDeliverRefreshTrigger++; return; }
		if (id === 'ready-for-pickup') { this.awaitingPickupRefreshTrigger++; return; }
		if (id === 'to-track') { this.toTrackRefreshTrigger++; return; }
		if (id === 'unpaid-delivery') { this.unpaidDeliveryRefreshTrigger++; return; }
		if (id === 'completed') { this.completedRefreshTrigger++; return; }
		if (id === 'cancelled') { this.cancelledRefreshTrigger++; return; }
	}

	onPhaseChange(event: { index: number }) {
		this.activePhaseIndex = event.index;
		this.loadOrdersForPhase(this.activePhaseIndex);
	}

	onOrderRowSelect(order: Order): void {
		this.selectedOrder = order;
	}

	viewOrderDetails(order: Order) {
		// Open order details in a dialog
		const ref = this.dialogService.open(AdminViewOrderComponent, {
			header: `Order Details - ${order.orderNumber}`,
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				orderId: order.id,
				order: order,
			},
		});

		ref.onClose.subscribe(() => {
			// Reload orders after closing dialog if needed
			this.loadOrdersForPhase(this.activePhaseIndex);
		});
	}


	openPlaceOrderDialog() {
		const ref = this.dialogService.open(AdminPlaceOrderComponent, {
			header: 'Place New Order',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: false,
		});

		ref.onClose.subscribe((order: any) => {
			if (order) {
				this.loadOrdersForPhase(this.activePhaseIndex);
			}
		});
	}
 
	deliverOrder(order: Order) {
		// Open deliver order dialog
		const ref = this.dialogService.open(AdminDeliverOrderComponent, {
			header: `Mark as Delivered - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: {
				order: order,
				orderId: order.id,
			},
		});

		ref.onClose.subscribe((deliveredOrder) => {
			if (deliveredOrder) {
				this.selectedOrder = deliveredOrder;
				this.loadOrdersForPhase(this.activePhaseIndex);
				this.cdr.markForCheck();
			}
		});
	}

	markCollected(order: Order) {
		this.orderService.markOrderAsCollected(order.id).subscribe({
			next: (res) => {
				this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order marked as collected' });
				this.selectedOrder = res;
				this.loadOrdersForPhase(this.activePhaseIndex);
				this.cdr.markForCheck();
			},
			error: (err) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to mark as collected' });
			},
		});
	}

	markConfirmed(order: Order) {
		this.orderService.markOrderAsConfirmed(order.id).subscribe({
			next: (res) => {
				this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order marked as confirmed' });
				this.selectedOrder = res;
				this.loadOrdersForPhase(this.activePhaseIndex);
				this.cdr.markForCheck();
			},
			error: (err) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to mark as confirmed' });
			},
		});
	}

	// Cancel Order
	openCancelDialog(order: Order) {
		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Cannot cancel delivered orders',
			});
			return;
		}

		this.selectedOrderForAction = order;
		this.actionNotes = '';
		this.showCancelDialog = true;
	}

	cancelOrder() {
		if (!this.selectedOrderForAction) return;

		const cancelData: CancelOrderDto = {
			reason: this.actionNotes?.trim() || undefined,
			internalNotes: this.actionNotes?.trim() || undefined,
		};

		this.orderService.cancelOrder(this.selectedOrderForAction.id, cancelData).subscribe({
		next: () => {
			const orderId = this.selectedOrderForAction!.id;
			this.messageService.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Order cancelled successfully',
			});
			this.showCancelDialog = false;
			this.selectedOrderForAction = null;
			this.selectedOrder = null;
			this.loadOrdersForPhase(this.activePhaseIndex);
			this.cdr.markForCheck();
		},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to cancel order',
				});
			},
		});
	}

	confirmOrder(order: Order) {
		// Open confirm order dialog
		const ref = this.dialogService.open(AdminConfirmOrderComponent, {
			header: `Confirm Order - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: {
				order: order,
				orderId: order.id,
			},
		});

		ref.onClose.subscribe((confirmedOrder) => {
			if (confirmedOrder) {
				this.selectedOrder = confirmedOrder;
				this.loadOrdersForPhase(this.activePhaseIndex);
				this.cdr.markForCheck();
			}
		});
	}

	shipOrder(order: Order) {
		// Open ship order dialog
		const ref = this.dialogService.open(AdminShipOrderComponent, {
			header: `Ship Order - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: {
				order: order,
				orderId: order.id,
			},
		});

		ref.onClose.subscribe((shippedOrder) => {
			if (shippedOrder) {
				this.selectedOrder = shippedOrder;
				this.loadOrdersForPhase(this.activePhaseIndex);
				this.cdr.markForCheck();
			}
		});
	}

	updateDeliveryDetails(order: Order) {
		const ref = this.dialogService.open(AdminShipOrderComponent, {
			header: `Update Delivery Details - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: { order, orderId: order.id, mode: 'update' },
		});
		ref.onClose.subscribe((updated: Order) => {
			if (updated) {
				this.selectedOrder = updated;
				this.loadOrdersForPhase(this.activePhaseIndex);
				this.cdr.markForCheck();
			}
		});
	}

	recordPayment(order: Order) {
		const ref = this.dialogService.open(AdminViewOrderComponent, {
			header: `Order - ${order.orderNumber}`,
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { orderId: order.id, order, highlightPayment: true },
		});
		ref.onClose.subscribe(() => this.loadOrdersForPhase(this.activePhaseIndex));
	}

	viewInvoice(order: Order) {
		const ref = this.dialogService.open(AdminViewInvoiceComponent, {
			header: `Invoice - ${order.orderNumber}`,
			width: '80%',
			style: { 'max-width': '1000px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				orderId: order.id,
				order: order,
			},
		});
	}

	 
}

