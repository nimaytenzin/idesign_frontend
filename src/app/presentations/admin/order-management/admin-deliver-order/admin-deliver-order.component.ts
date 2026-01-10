import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { Order, DeliverOrderDto } from '../../../../core/dataservice/order/order.interface';
import { FulfillmentStatus } from '../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-deliver-order',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-deliver-order.component.html',
	styleUrls: ['./admin-deliver-order.component.scss'],
})
export class AdminDeliverOrderComponent implements OnInit {
	order: Order | null = null;
	internalNotes: string = '';
	loading: boolean = false;

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

	deliverOrder() {
		if (!this.order) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Order not found',
			});
			return;
		}

		if (this.order.fulfillmentStatus !== FulfillmentStatus.SHIPPING) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Only SHIPPING orders can be marked as delivered',
			});
			return;
		}

		this.loading = true;
		const deliverData: DeliverOrderDto = {
			internalNotes: this.internalNotes?.trim() || undefined,
		};

		this.orderService.markOrderAsDelivered(this.order.id, deliverData).subscribe({
			next: (updatedOrder) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Order marked as delivered successfully',
				});
				this.ref.close(updatedOrder);
			},
			error: (error) => {
				this.loading = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to mark order as delivered',
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
