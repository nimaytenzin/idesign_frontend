import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { Order, ConfirmOrderDto } from '../../../../core/dataservice/order/order.interface';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-confirm-order',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-confirm-order.component.html',
	styleUrls: ['./admin-confirm-order.component.scss'],
})
export class AdminConfirmOrderComponent implements OnInit {
	order: Order | null = null;
	paymentMethod: PaymentMethod | null = null;
	transactionId: string = '';
	internalNotes: string = '';
	loading: boolean = false;

	paymentMethods = [
		{ label: 'Cash', value: 'CASH' },
		{ label: 'MBOB', value: 'MBOB' },
		{ label: 'BDB EPay', value: 'BDB_EPAY' },
		{ label: 'TPay', value: 'TPAY' },
		{ label: 'BNB MPay', value: 'BNB_MPAY' },
		{ label: 'ZPSS', value: 'ZPSS' },
	];

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config.data?.order) {
			this.order = this.config.data.order;
		} else if (this.config.data?.orderId) {
			this.loadOrder(this.config.data.orderId);
		}
	}

	loadOrder(orderId: number) {
		this.loading = true;
		this.orderService.getOrderById(orderId).subscribe({
			next: (order) => {
				this.order = order;
				this.loading = false;
			},
			error: () => {
				this.loading = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load order details',
				});
			},
		});
	}

	confirmOrder() {
		if (!this.order) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Order not found',
			});
			return;
		}

		if (!this.paymentMethod) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select a payment method',
			});
			return;
		}

		if (this.order.fulfillmentStatus !== 'PLACED') {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Only PLACED orders can be confirmed',
			});
			return;
		}

		this.loading = true;
		const confirmData: ConfirmOrderDto = {
			paymentMethod: this.paymentMethod,
			transactionId: this.transactionId?.trim() || undefined,
			internalNotes: this.internalNotes?.trim() || undefined,
		};

		this.orderService.confirmOrder(this.order.id, confirmData).subscribe({
			next: (updatedOrder) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Order confirmed successfully',
				});
				this.ref.close(updatedOrder);
			},
			error: (error) => {
				this.loading = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to confirm order',
				});
			},
		});
	}

	cancel() {
		this.ref.close();
	}

	formatCurrency(value: number | null | undefined): string {
		if (!value) return 'Nu. 0.00';
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value)}`;
	}
}
