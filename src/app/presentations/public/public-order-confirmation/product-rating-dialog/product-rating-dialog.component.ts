import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import { Product } from '../../../../core/dataservice/product/product.interface';
import { OrderItem } from '../../../../core/dataservice/order/order.interface';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ImageUtilityService } from '../../../../core/utility/image-utility.service';

interface ProductRating {
	productId: number;
	product: Product | null;
	rating: number;
	submitted: boolean;
}

@Component({
	selector: 'app-product-rating-dialog',
	standalone: true,
	imports: [CommonModule, DialogModule, ButtonModule, ToastModule],
	providers: [MessageService],
	templateUrl: './product-rating-dialog.component.html',
	styleUrls: ['./product-rating-dialog.component.scss'],
})
export class ProductRatingDialogComponent implements OnInit, OnChanges {
	@Input() visible: boolean = false;
	@Output() visibleChange = new EventEmitter<boolean>();
	@Input() orderItems: OrderItem[] = [];
	
	productRatings: ProductRating[] = [];
	loading: boolean = false;

	constructor(
		private productService: ProductService,
		private messageService: MessageService,
		private imageUtilityService: ImageUtilityService
	) {}

	ngOnInit() {
		this.initializeRatings();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['orderItems'] && this.orderItems.length > 0) {
			this.initializeRatings();
		}
	}

	initializeRatings() {
		this.productRatings = this.orderItems.map((item) => ({
			productId: item.productId,
			product: item.product || null,
			rating: 0,
			submitted: false,
		}));
	}

	setRating(productId: number, rating: number) {
		const productRating = this.productRatings.find(
			(pr) => pr.productId === productId
		);
		if (productRating && !productRating.submitted) {
			productRating.rating = rating;
		}
	}

	submitRating(productId: number) {
		const productRating = this.productRatings.find(
			(pr) => pr.productId === productId
		);
		
		if (!productRating || productRating.rating === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Rating Required',
				detail: 'Please select a rating before submitting.',
			});
			return;
		}

		if (productRating.submitted) {
			return;
		}

		this.loading = true;
		this.productService.updateRating(productId, productRating.rating).subscribe({
			next: (updatedProduct) => {
				productRating.submitted = true;
				productRating.product = updatedProduct;
				this.messageService.add({
					severity: 'success',
					summary: 'Rating Submitted',
					detail: 'Thank you for your rating!',
				});
				this.loading = false;
			},
			error: (error) => {
				console.error('Error submitting rating:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to submit rating. Please try again.',
				});
				this.loading = false;
			},
		});
	}

	closeDialog() {
		this.visible = false;
		this.visibleChange.emit(false);
	}

	getProductImage(product: Product | null): string {
		if (!product || !product.images || product.images.length === 0) {
			return '/assets/images/no-image.png';
		}
		return this.imageUtilityService.getPrimaryImageUrl(product.images);
	}
}

