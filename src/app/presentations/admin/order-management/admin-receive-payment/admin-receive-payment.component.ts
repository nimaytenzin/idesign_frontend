import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { Order, ProcessPaymentDto } from '../../../../core/dataservice/order/order.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-receive-payment',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-receive-payment.component.html',
	styleUrls: ['./admin-receive-payment.component.scss'],
})
export class AdminReceivePaymentComponent implements OnInit {
	order: Order | null = null;
	paymentMethod: string = 'CASH';
	internalNotes: string = '';
	paymentDate: Date = new Date();
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
		}
	}

	submitPayment() {
		if (!this.order) return;

		this.loading = true;
		const paymentData: ProcessPaymentDto = {
			paymentMethod: this.paymentMethod as any,
			paymentDate: this.paymentDate.toISOString(),
		};

		// Update order with internal notes if provided
		if (this.internalNotes.trim()) {
			this.orderService.updateOrder(this.order.id, {
				internalNotes: this.internalNotes.trim(),
			}).subscribe({
				next: () => {
					this.processPayment(paymentData);
				},
				error: (error) => {
					this.loading = false;
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update order notes',
					});
				},
			});
		} else {
			this.processPayment(paymentData);
		}
	}

	private processPayment(paymentData: ProcessPaymentDto) {
		if (!this.order) return;

		this.orderService.processPayment(this.order.id, paymentData).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Payment recorded successfully',
				});
				this.ref.close(true);
			},
			error: (error) => {
				this.loading = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to record payment',
				});
			},
		});
	}

	cancel() {
		this.ref.close();
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}
}

