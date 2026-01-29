import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { Order, FulfillmentStatus, PaymentStatus, OrderSource, FulfillmentType } from '../../../../../../core/dataservice';
import { OrderService } from '../../../../../../core/dataservice/order/order.service';

@Component({
	selector: 'app-admin-tab-awaiting-pickup',
	standalone: true,
	imports: [CommonModule, FormsModule, TableModule, TagModule],
	templateUrl: './admin-tab-awaiting-pickup.component.html',
})
export class AdminTabAwaitingPickupComponent implements OnInit, OnChanges {
	@Input() refreshTrigger = 0;

	orders: Order[] = [];
	loading = false;

	@Output() rowSelect = new EventEmitter<Order>();
	FulfillmentStatus = FulfillmentStatus;
	PaymentStatus = PaymentStatus;
	OrderSource = OrderSource;
	FulfillmentType = FulfillmentType;

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
		this.loadOrders();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
			this.loadOrders();
		}
	}

	loadOrders(): void {
		this.loading = true;
		this.cdr.markForCheck();
		this.orderService.getOrdersReadyForPickup().subscribe({
			next: (data: Order[]) => {
				this.orders = data ?? [];
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders awaiting pickup' });
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	getStatusSeverity(s: FulfillmentStatus): string {
		const m: Record<string, string> = { PLACED: 'secondary', CONFIRMED: 'info', PROCESSING: 'warning', SHIPPING: 'info', DELIVERED: 'success', CANCELED: 'danger' };
		return m[s] || 'secondary';
	}

	getPaymentSeverity(s: PaymentStatus): string {
		const m: Record<string, string> = { PENDING: 'warning', PARTIAL: 'warning', PAID: 'success', FAILED: 'danger' };
		return m[s] || 'secondary';
	}

	formatCurrency(v: number | null | undefined): string {
		const n = (v != null && !isNaN(v) && isFinite(v)) ? v : 0;
		return `Nu. ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
	}

	formatDate(d: Date | string | undefined): string {
		if (!d) return 'N/A';
		return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}
}
