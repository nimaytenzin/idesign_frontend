import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCarouselComponent } from '../../../shared/components/product-carousel/product-carousel.component';
import { OrderService } from '../../../core/dataservice/order/order.service';
import { Order, TrackOrderDto,  } from '../../../core/dataservice/order/order.interface';
import { MessageService } from 'primeng/api';
import { PrimeNgModules } from '../../../primeng.modules';
import { CompanyService } from '../../../core/dataservice/company/company.service';
import { Company } from '../../../core/dataservice/company/company.interface';
import { environment } from '../../../../environments/environment';
import { PublicOrderTrackingComponent } from '../public-order-tracking/public-order-tracking.component';
import { PublicCompanyClientComponent } from '../public-company-client/public-company-client.component';
import { HeroSliderComponent } from '../hero-slider/hero-slider.component';
import { DiscountService } from '../../../core/dataservice/discount/discount.service';
import { DiscountResponseDto, DiscountValueType, DiscountType } from '../../../core/dataservice/discount/discount.interface';
import { ProductService } from '../../../core/dataservice/product/product.service';
import { Product } from '../../../core/dataservice/product/product.interface';
import { ImageUtilityService } from '../../../core/utility/image-utility.service';

@Component({
	selector: 'app-public-home',
	standalone: true,
	imports: [CommonModule, FormsModule, ProductCarouselComponent, PrimeNgModules,PublicOrderTrackingComponent, PublicCompanyClientComponent,HeroSliderComponent],
	providers: [MessageService],
	templateUrl: './public-home.component.html',
	styleUrls: ['./public-home.component.scss'],
})
export class PublicHomeComponent implements OnInit {
	trackingForm: TrackOrderDto = {
		orderNumber: '',
		phoneNumber: '',
	};
	trackingResults: Order | Order[] | null = null;
	trackingLoading = false;
	showTrackingResults = false;
	company: Company | null = null;
	loading = false;
	activeDiscounts: DiscountResponseDto[] = [];
	discountsLoading = false;
	discountProductsMap: Map<number, Product[]> = new Map();

	constructor(
		private router: Router,
		private orderService: OrderService,
		private messageService: MessageService,
		private companyService: CompanyService,
		private discountService: DiscountService,
		private productService: ProductService,
		private imageUtilityService: ImageUtilityService
	) {}

	ngOnInit(): void {
		this.loadCompany();
		this.loadActiveDiscounts();
	}

	loadCompany(): void {
		this.loading = true;
		this.companyService.getCompany().subscribe({
			next: (data) => {
				this.company = data;
				this.loading = false;
			},
			error: () => {
				// If company doesn't exist, use default values
				this.company = null;
				this.loading = false;
			},
		});
	}

	exploreProducts(): void {
		this.router.navigate(['/products']);
	}

	getCustomQuote(): void {
		this.router.navigate(['/custom-orders']);
	}

	onImageError(event: any, fallbackSrc: string): void {
		event.target.src = fallbackSrc;
	}

	trackOrder(): void {
		// Validate that at least one field is provided
		if (!this.trackingForm.orderNumber && !this.trackingForm.phoneNumber) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please provide either an order number or phone number',
			});
			return;
		}

		// Clear previous results
		this.trackingResults = null;
		this.trackingLoading = true;
		this.showTrackingResults = false;

		this.orderService.trackOrder(this.trackingForm).subscribe({
			next: (results) => {
				this.trackingResults = results;
				this.showTrackingResults = true;
				this.trackingLoading = false;

				const isArray = Array.isArray(results);
				const count = isArray ? results.length : 1;
				this.messageService.add({
					severity: 'success',
					summary: 'Order Found',
					detail: `Found ${count} order${count > 1 ? 's' : ''}`,
				});
			},
			error: (error) => {
				this.trackingLoading = false;
				this.showTrackingResults = false;
				const errorMessage =
					error.error?.message ||
					error.message ||
					'Failed to track order. Please check your information and try again.';
				this.messageService.add({
					severity: 'error',
					summary: 'Tracking Failed',
					detail: errorMessage,
				});
			},
		});
	}

	isArray(value: any): value is Order[] {
		return Array.isArray(value);
	}

	getSingleOrder(): Order | null {
		if (this.trackingResults && !this.isArray(this.trackingResults)) {
			return this.trackingResults;
		}
		return null;
	}

	getOrdersArray(): Order[] | null {
		if (this.trackingResults && this.isArray(this.trackingResults)) {
			return this.trackingResults;
		}
		return null;
	}

	

	

	resetTracking(): void {
		this.trackingForm = {
			orderNumber: '',
			phoneNumber: '',
		};
		this.trackingResults = null;
		this.showTrackingResults = false;
	}

	// Company helper methods
	getCompanyName(): string {
		return this.company?.name || 'iDesign';
	}

	getCompanySlogan(): string {
		return this.company?.slogan || '3D Printing Excellence';
	}

	getCompanyDescription(): string {
		return this.company?.description || 'Discover our exclusive collection of 3D printed Bhutanese stupas, Buddha statues, and spiritual artifacts. Where traditional craftsmanship meets modern technology.';
	}

	getLogoUrl(logoPath: string | undefined): string {
		if (!logoPath) {
			return '/assets/logo.png';
		}
		if (logoPath.startsWith('http')) {
			return logoPath;
		}
		return `${environment.BASEAPI_URL}/${logoPath}`;
	}

	getPhone(): string {
		return this.company?.phone1 || '';
	}

	getEmail(): string {
		return this.company?.email || '';
	}

	getAddress(): string {
		if (this.company?.address) {
			let address = this.company.address;
			if (this.company.dzongkhag) {
				address += `, ${this.company.dzongkhag}`;
			}
			if (this.company.country) {
				address += `, ${this.company.country}`;
			}
			return address;
		}
		return '';
	}

	loadActiveDiscounts(): void {
		this.discountsLoading = true;
		this.discountService.getActiveDiscountsPublic().subscribe({
			next: (discounts) => {
				this.activeDiscounts = discounts;
				// Load products for product-based discounts
				this.loadProductsForDiscounts(discounts);
				this.discountsLoading = false;
			},
			error: () => {
				this.activeDiscounts = [];
				this.discountsLoading = false;
			},
		});
	}

	loadProductsForDiscounts(discounts: DiscountResponseDto[]): void {
		discounts.forEach((discount) => {
			// Only load products for product-based discounts
			if (discount.discountType === DiscountType.FLAT_SELECTED_PRODUCTS) {
				const discountWithProducts = discount as any;
				
				// Check if products are already included in the response
				if (discountWithProducts.products && Array.isArray(discountWithProducts.products) && discountWithProducts.products.length > 0) {
					// Products are already included in the response
					this.discountProductsMap.set(discount.id, discountWithProducts.products);
				} else if (discountWithProducts.productIds && discountWithProducts.productIds.length > 0) {
					// Fetch products by IDs
					this.fetchProductsByIds(discount.id, discountWithProducts.productIds);
				} else if (discountWithProducts.discountProducts && discountWithProducts.discountProducts.length > 0) {
					// If discountProducts array is included, extract productIds
					const productIds = discountWithProducts.discountProducts.map((dp: any) => dp.productId);
					if (productIds.length > 0) {
						this.fetchProductsByIds(discount.id, productIds);
					}
				}
			}
		});
	}

	fetchProductsByIds(discountId: number, productIds: number[]): void {
		// Fetch each product individually (or batch if API supports it)
		const productPromises = productIds.map((id) =>
			this.productService.getProductById(id).toPromise()
		);

		Promise.all(productPromises)
			.then((products) => {
				const validProducts = products.filter((p) => p !== undefined && p !== null) as Product[];
				this.discountProductsMap.set(discountId, validProducts);
			})
			.catch((error) => {
				console.error(`Error loading products for discount ${discountId}:`, error);
			});
	}

	getDiscountProducts(discountId: number): Product[] {
		return this.discountProductsMap.get(discountId) || [];
	}

	isProductBasedDiscount(discount: DiscountResponseDto): boolean {
		return discount.discountType === DiscountType.FLAT_SELECTED_PRODUCTS;
	}

	getProductImageUrl(product: Product): string {
		return this.imageUtilityService.getPrimaryImageUrl(product.images);
	}

	navigateToProduct(productId: number): void {
		this.router.navigate(['/products'], { queryParams: { productId } });
	}

	formatDiscountValue(discount: DiscountResponseDto): string {
		if (discount.valueType === DiscountValueType.PERCENTAGE) {
			return `${discount.discountValue}% OFF`;
		} else {
			return `Nu. ${discount.discountValue.toFixed(2)} OFF`;
		}
	}

	getDaysRemaining(endDate: string): number {
		const end = new Date(endDate);
		const now = new Date();
		const diffTime = end.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	}

	navigateToProducts(): void {
		console.log('navigateToProducts called');
		// Navigate to product catalog
		this.router.navigate(['/products']).then(
			(success) => {
				console.log('Navigation successful:', success);
			},
			(error) => {
				console.error('Navigation error:', error);
			}
		);
	}

	calculateOriginalPrice(product: Product, discount: DiscountResponseDto): number {
		if (discount.valueType === DiscountValueType.PERCENTAGE) {
			// If price is already discounted, calculate original
			return product.price / (1 - discount.discountValue / 100);
		} else {
			// For fixed amount, add the discount value back
			return product.price + discount.discountValue;
		}
	}

	calculateDiscountedPrice(product: Product, discount: DiscountResponseDto): number {
		if (discount.valueType === DiscountValueType.PERCENTAGE) {
			return product.price * (1 - discount.discountValue / 100);
		} else {
			return Math.max(0, product.price - discount.discountValue);
		}
	}
}
