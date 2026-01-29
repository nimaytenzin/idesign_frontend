import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
	selector: 'app-public-order-cancelled',
	standalone: true,
	imports: [CommonModule, ButtonModule, CardModule],
	templateUrl: './public-order-cancelled.component.html',
	styleUrls: ['./public-order-cancelled.component.scss'],
})
export class PublicOrderCancelledComponent implements OnInit {
	orderId: number | null = null;
	orderNumber: string | null = null;

	constructor(
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			this.orderId = params['orderId'] ? Number(params['orderId']) : null;
			this.orderNumber = params['orderNumber'] || null;
		});
	}

	goToProducts() {
		this.router.navigate(['/products']);
	}

	goToHome() {
		this.router.navigate(['/']);
	}

	goToCheckout() {
		this.router.navigate(['/checkout']);
	}
}
