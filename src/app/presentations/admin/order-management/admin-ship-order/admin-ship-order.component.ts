import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { Order, ShipOrderDto } from '../../../../core/dataservice/order/order.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-ship-order',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-ship-order.component.html',
	styleUrls: ['./admin-ship-order.component.scss'],
})
export class AdminShipOrderComponent implements OnInit {
	order: Order | null = null;
	driverName: string = '';
	driverPhone: string = '';
	vehicleNumber: string = '';
	expectedDeliveryDate: Date | null = null;
	deliveryNotes: string = '';
	loading: boolean = false;
	minDate: Date = new Date();

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config.data?.order) {
			this.order = this.config.data.order;
			// Pre-populate deliveryNotes if it exists
			if (this.order?.deliveryNotes) {
				this.deliveryNotes = this.order.deliveryNotes;
			}
		} else if (this.config.data?.orderId) {
			this.loadOrder(this.config.data.orderId);
		}
	}

	loadOrder(orderId: number) {
		this.loading = true;
		this.orderService.getOrderById(orderId).subscribe({
			next: (order) => {
				this.order = order;
				// Pre-populate deliveryNotes if it exists
				if (order.deliveryNotes) {
					this.deliveryNotes = order.deliveryNotes;
				}
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

	shipOrder() {
		if (!this.order) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Order not found',
			});
			return;
		}

		if (!this.driverName || !this.driverName.trim()) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Driver name is required',
			});
			return;
		}

		if (!this.vehicleNumber || !this.vehicleNumber.trim()) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Vehicle number is required',
			});
			return;
		}

		if (!this.expectedDeliveryDate) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Expected delivery date is required',
			});
			return;
		}

		if (this.order.fulfillmentStatus !== 'PROCESSING') {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Only PROCESSING orders can be shipped',
			});
			return;
		}

		this.loading = true;
		const shipData: ShipOrderDto = {
			driverName: this.driverName.trim(),
			driverPhone: this.driverPhone?.trim() || undefined,
			vehicleNumber: this.vehicleNumber.trim(),
			expectedDeliveryDate: this.expectedDeliveryDate.toISOString(),
			deliveryNotes: this.deliveryNotes?.trim() || undefined,
		};

		this.orderService.shipOrder(this.order.id, shipData).subscribe({
			next: (updatedOrder) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Order shipped successfully',
				});
				this.ref.close(updatedOrder);
			},
			error: (error) => {
				this.loading = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to ship order',
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
