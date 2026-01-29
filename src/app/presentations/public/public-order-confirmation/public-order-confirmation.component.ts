import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { OrderService } from '../../../core/dataservice/order/order.service';
import { ProductRatingDialogComponent } from './product-rating-dialog/product-rating-dialog.component';
import { PaymentStatus, FulfillmentType } from '../../../core/constants/enums';
import { Order } from '../../../core/dataservice';

@Component({
	selector: 'app-public-order-confirmation',
	standalone: true,
	imports: [CommonModule, ButtonModule, CardModule, ProductRatingDialogComponent],
	templateUrl: './public-order-confirmation.component.html',
	styleUrls: ['./public-order-confirmation.component.scss'],
})
export class PublicOrderConfirmationComponent implements OnInit {
	PaymentStatus = PaymentStatus; // Expose enum to template
	FulfillmentType = FulfillmentType;
	orderId: number | null = null;
	orderNumber: string | null = null;
	order: Order | null = null;
	loading = true;
	ratingDialogVisible = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private orderService: OrderService
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			this.orderId = params['orderId'] ? Number(params['orderId']) : null;
			this.orderNumber = params['orderNumber'] || null;

			if (this.orderId) {
				this.loadOrderDetails();
			} else {
				this.loading = false;
			}

			// If coming from payment success, reload order to get updated status
			if (params['paymentSuccess'] === 'true' && this.orderId) {
				// Small delay to ensure backend has processed the payment
				setTimeout(() => {
					this.loadOrderDetails();
				}, 1000);
			}
		});
	}

	loadOrderDetails() {
		if (!this.orderId) return;

		this.orderService.getOrderById(this.orderId).subscribe({
			next: (order) => {
				this.order = order;
				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading order:', error);
				this.loading = false;
			},
		});
	}

	formatPrice(price: number): string {
		return `Nu ${new Intl.NumberFormat('en-BT', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)}`;
	}

	/** Human-readable fulfillment/delivery mode. */
	getFulfillmentLabel(): string {
		if (!this.order) return '';
		switch (this.order.fulfillmentType) {
			case FulfillmentType.DELIVERY:
				return 'Delivery to address';
			case FulfillmentType.PICKUP:
				return 'Pick up in store';
			case FulfillmentType.INSTORE:
				return 'In store';
			default:
				return this.order.fulfillmentType || '—';
		}
	}

	/** Print or save order summary. */
	printOrderSummary(): void {
		window.print();
	}

	goToProducts() {
		this.router.navigate(['/products']);
	}

	goToHome() {
		this.router.navigate(['/']);
	}

	goToPayment() {
		if (this.orderId) {
			this.router.navigate(['/order-payment'], {
				queryParams: { orderId: this.orderId },
			});
		}
	}

	openRatingDialog() {
		this.ratingDialogVisible = true;
	}

	closeRatingDialog() {
		this.ratingDialogVisible = false;
	}
}

