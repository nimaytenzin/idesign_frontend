import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { Order, FulfillmentStatus, OrderType, PaymentStatus } from '../../../../core/dataservice/order/order.interface';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
@Component({
	selector: 'app-admin-view-order',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-view-order.component.html',
	styleUrls: ['./admin-view-order.component.scss'],
})
export class AdminViewOrderComponent implements OnInit {
	order: Order | null = null;
	loading: boolean = false;
	FulfillmentStatus = FulfillmentStatus;
	OrderType = OrderType;
	PaymentStatus = PaymentStatus;

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit() {
		const orderId = this.config.data?.orderId;
		if (orderId) {
			this.loadOrder(orderId);
		} else if (this.config.data?.order) {
			this.order = this.config.data.order;
		}
	}

	loadOrder(id: number) {
		this.loading = true;
		this.orderService.getOrderById(id).subscribe({
			next: (data) => {
				this.order = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load order',
				});
				this.loading = false;
				this.ref.close();
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
		case FulfillmentStatus.SHIPPING:
			return 'info';
			case FulfillmentStatus.DELIVERED:
				return 'success';
			case FulfillmentStatus.CANCELED:
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

	close() {
		this.ref.close();
	}
}

