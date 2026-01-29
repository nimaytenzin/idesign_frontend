import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { CustomerService } from '../../../../core/dataservice/customer/customer.service';
import { Order } from '../../../../core/dataservice/order/order.interface';
import { Customer } from '../../../../core/dataservice/customer/customer.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
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
	providers: [MessageService, ConfirmationService],
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

	// Inline order details (row click)
	selectedOrder: Order | null = null;

	constructor(
		private orderService: OrderService,
		private customerService: CustomerService,
		private messageService: MessageService,
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

	/** Called by details panel when an order was updated (e.g. after mark confirmed, ship, deliver). */
	onOrderUpdated(order: Order | null): void {
		this.selectedOrder = order;
		this.cdr.markForCheck();
	}

	/** Called by details panel when lists should be refreshed (e.g. after dialog close or API success). */
	onRefreshRequested(): void {
		this.loadOrdersForPhase(this.activePhaseIndex);
		this.cdr.markForCheck();
	}
}

