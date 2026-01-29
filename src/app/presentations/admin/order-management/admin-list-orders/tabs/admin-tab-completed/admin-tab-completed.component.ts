import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { Order, FulfillmentStatus, PaymentStatus, OrderSource, FulfillmentType } from '../../../../../../core/dataservice';
import { OrderService } from '../../../../../../core/dataservice/order/order.service';

@Component({
	selector: 'app-admin-tab-completed',
	standalone: true,
	imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, CalendarModule, PaginatorModule],
	templateUrl: './admin-tab-completed.component.html',
})
export class AdminTabCompletedComponent implements OnInit, OnChanges {
	@Input() refreshTrigger = 0;

	@Output() rowSelect = new EventEmitter<Order>();
	orders: Order[] = [];
	loading = false;
	pagination: { page: number; limit: number; total: number; totalPages: number } = { page: 1, limit: 25, total: 0, totalPages: 0 };
	historyDateFrom: Date = new Date();
	historyDateTo: Date = new Date();
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
		this.setHistoryDateRangeCurrentMonth();
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
		this.orderService.getOrdersAdminCompleted({
			page: this.pagination.page,
			limit: this.pagination.limit,
			deliveredAtFrom: this.toIsoDateString(this.historyDateFrom),
			deliveredAtTo: this.toIsoDateString(this.historyDateTo),
		}).subscribe({
			next: (data) => {
				this.orders = data.data ?? [];
				this.pagination = { ...this.pagination, page: data.meta.page, limit: data.meta.limit, total: data.meta.total, totalPages: data.meta.totalPages };
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load completed orders' });
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	private toIsoDateString(d: Date): string {
		return d.toISOString().split('T')[0];
	}

	setHistoryDateRangeCurrentMonth(): void {
		const n = new Date();
		this.historyDateFrom = new Date(n.getFullYear(), n.getMonth(), 1);
		this.historyDateTo = new Date(n.getFullYear(), n.getMonth() + 1, 0);
		this.pagination.page = 1;
	}

	setHistoryDateRangeLast30Days(): void {
		const to = new Date();
		const from = new Date();
		from.setDate(from.getDate() - 30);
		this.historyDateFrom = from;
		this.historyDateTo = to;
		this.pagination.page = 1;
	}

	onFromSelect(v: Date): void {
		this.historyDateFrom = v;
		this.pagination.page = 1;
		this.loadOrders();
	}

	onToSelect(v: Date): void {
		this.historyDateTo = v;
		this.pagination.page = 1;
		this.loadOrders();
	}

	onPageChange(event: { page?: number; rows?: number }): void {
		this.pagination.page = (event?.page ?? 0) + 1;
		this.pagination.limit = event?.rows ?? 25;
		this.loadOrders();
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
