import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../core/dataservice/product-sub-category/product-sub-category.service';
import { Product, ProductImage } from '../../../core/dataservice/product/product.interface';
import { ProductCategory, ProductSubCategory } from '../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../primeng.modules';
import { environment } from '../../../../environments/environment';
import { ImageUtilityService } from '../../../core/utility/image-utility.service';
import { CartService } from '../../../core/services/cart.service';
import { Discount, DiscountValueType } from '../../../core/dataservice/discount/discount.interface';

@Component({
	selector: 'app-public-view-product',
	standalone: true,
	imports: [CommonModule, PrimeNgModules, RouterLink],
	providers: [MessageService],
	templateUrl: './public-view-product.component.html',
	styleUrls: ['./public-view-product.component.scss'],
})
export class PublicViewProductComponent implements OnInit {
	productId: number | null = null;
	loading: boolean = false;
	product: Product | null = null;

	// Categories
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];

	// Images
	selectedImageIndex: number = 0;

	// Quantity selector
	quantity: number = 1;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private productService: ProductService,
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private imageUtilityService: ImageUtilityService,
		private cartService: CartService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCategories();
		
		// Get product ID from route
		this.route.params.subscribe(params => {
			const id = params['id'];
			if (id) {
				this.productId = +id;
				this.loadProduct();
			}
		});
	}

	loadCategories() {
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data.filter(cat => cat.isActive);
				this.loadSubCategories();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load categories',
				});
			},
		});
	}

	loadSubCategories() {
		this.subCategoryService.getSubCategories().subscribe({
			next: (data) => {
				this.subCategories = data.filter(sub => sub.isActive);
				this.cdr.markForCheck();
			},
		});
	}

	loadProduct() {
		if (!this.productId) return;
		this.loading = true;
		this.productService.getProductById(this.productId).subscribe({
			next: (data) => {
				this.product = data;
				// Set primary image as selected
				const primaryIndex = data.images?.findIndex(img => img.isPrimary) ?? 0;
				this.selectedImageIndex = primaryIndex >= 0 ? primaryIndex : 0;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load product',
				});
				this.loading = false;
				this.router.navigate(['/products']);
				this.cdr.markForCheck();
			},
		});
	}

	selectImage(index: number) {
		this.selectedImageIndex = index;
	}

	previousImage() {
		if (this.selectedImageIndex > 0) {
			this.selectedImageIndex--;
		}
	}

	nextImage() {
		const images = this.getAllImages();
		if (this.selectedImageIndex < images.length - 1) {
			this.selectedImageIndex++;
		}
	}

	getImageUrl(imagePath: string): string {
		if (!imagePath) {
			return '/assets/images/no-image.png';
		}
		if (imagePath.startsWith('http')) {
			return imagePath;
		}
		const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
		return `${environment.BASEAPI_URL}/${cleanPath}`;
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}

	getCategoryName(categoryId: number): string {
		const category = this.categories.find((c) => c.id === categoryId);
		return category?.name || '';
	}

	getSubCategoryName(subCategoryId: number): string {
		const subCategory = this.subCategories.find((s) => s.id === subCategoryId);
		return subCategory?.name || 'N/A';
	}

	getPrimaryImage(): string {
		if (!this.product?.images || this.product.images.length === 0) {
			return '/assets/images/no-image.png';
		}
		const primaryImage = this.product.images.find(img => img.isPrimary);
		const imagePath = primaryImage?.imagePath || this.product.images[0]?.imagePath;
		return this.getImageUrl(imagePath);
	}

	getAllImages(): ProductImage[] {
		return this.product?.images || [];
	}

	// Quantity management
	incrementQuantity() {
		if (this.product && this.product.stockQuantity) {
			const maxQuantity = this.product.stockQuantity;
			if (this.quantity < maxQuantity) {
				this.quantity++;
			}
		} else {
			this.quantity++;
		}
	}

	decrementQuantity() {
		if (this.quantity > 1) {
			this.quantity--;
		}
	}

	// Cart functionality
	addToCart() {
		if (!this.product) return;

		// Get current cart items to calculate total for this product
		const currentCartItems = this.cartService.getCartItems();
		const existingItem = currentCartItems.find(item => item.product.id === this.product!.id);
		const currentQuantity = existingItem ? existingItem.quantity : 0;
		const newQuantity = currentQuantity + this.quantity;
		
		// Get discount info based on the new quantity (cart total for this product)
		const discountInfo = this.getDiscountInfo(this.product, newQuantity);
		
		// Only apply discount if it can be applied (constraints met)
		const discount = discountInfo.canApply ? discountInfo.bestDiscount : null;
		
		// Add to cart with discount information (only if can be applied)
		this.cartService.addToCart(this.product, this.quantity, discount);
		
		this.messageService.add({
			severity: 'success',
			summary: 'Added to Cart',
			detail: `${this.quantity} x ${this.product.title} has been added to your cart`,
			life: 3000,
		});
		
		this.cdr.markForCheck();
	}

	// Discount helper methods
	hasDiscount(product: Product): boolean {
		const activeDiscounts = this.getActiveDiscounts(product);
		return activeDiscounts.length > 0;
	}

	getDiscountInfo(product: Product, quantity: number = 1) {
		const activeDiscounts = this.getActiveDiscounts(product);
		
		if (activeDiscounts.length === 0) {
			return {
				originalPrice: product.price,
				discountedPrice: product.price,
				discountAmount: 0,
				discountPercentage: 0,
				bestDiscount: null,
				canApply: false,
			};
		}

		// Calculate cart total for this product (quantity * price)
		const cartTotalForProduct = product.price * quantity;

		// Get the best discount (highest discount amount)
		let bestDiscount: Discount | null = null;
		let maxDiscountAmount = 0;
		let canApplyDiscount = false;

		for (const discount of activeDiscounts) {
			// Check if minimum order value constraint is met
			const meetsMinOrderValue = !discount.minOrderValue || 
				discount.minOrderValue === null || 
				cartTotalForProduct >= discount.minOrderValue;

			// Only calculate discount if constraint is met
			if (meetsMinOrderValue) {
				const discountAmount = this.calculateDiscountAmount(product.price, discount);
				if (discountAmount > maxDiscountAmount) {
					maxDiscountAmount = discountAmount;
					bestDiscount = discount;
					canApplyDiscount = true;
				}
			} else {
				// If this discount has higher potential but constraint not met, still track it
				// but don't apply it
				if (!bestDiscount) {
					const discountAmount = this.calculateDiscountAmount(product.price, discount);
					if (discountAmount > maxDiscountAmount) {
						maxDiscountAmount = discountAmount;
						bestDiscount = discount;
						canApplyDiscount = false;
					}
				}
			}
		}

		// Only apply discount if constraint is met
		const discountedPrice = canApplyDiscount 
			? Math.max(0, product.price - maxDiscountAmount)
			: product.price;
		
		const discountPercentage = bestDiscount && canApplyDiscount
			? bestDiscount.valueType === DiscountValueType.PERCENTAGE
				? bestDiscount.discountValue
				: (maxDiscountAmount / product.price) * 100
			: 0;

		return {
			originalPrice: product.price,
			discountedPrice: discountedPrice,
			discountAmount: canApplyDiscount ? maxDiscountAmount : 0,
			discountPercentage: Math.round(discountPercentage),
			bestDiscount: bestDiscount,
			canApply: canApplyDiscount,
		};
	}

	private getActiveDiscounts(product: Product): Discount[] {
		if (!product.discountProducts || product.discountProducts.length === 0) {
			return [];
		}

		const now = new Date();
		return product.discountProducts
			.map((dp) => dp.discount)
			.filter((discount: Discount | undefined): discount is Discount => {
				if (!discount) return false;
				if (!discount.isActive) return false;
				
				const startDate = new Date(discount.startDate);
				const endDate = new Date(discount.endDate);
				
				return now >= startDate && now <= endDate;
			});
	}

	private calculateDiscountAmount(price: number, discount: Discount): number {
		// Ensure discountValue is a number
		const discountValue = typeof discount.discountValue === 'string' 
			? parseFloat(discount.discountValue) 
			: discount.discountValue;

		if (discount.valueType === DiscountValueType.PERCENTAGE) {
			return (price * discountValue) / 100;
		} else {
			// FIXED_AMOUNT
			return Math.min(discountValue, price);
		}
	}

	getDiscountBadgeText(product: Product): string {
		const activeDiscounts = this.getActiveDiscounts(product);
		if (activeDiscounts.length === 0) {
			return '';
		}

		// Get the best discount (for display, regardless of constraints)
		let bestDiscount: Discount | null = null;
		let maxDiscountAmount = 0;

		for (const discount of activeDiscounts) {
			const discountAmount = this.calculateDiscountAmount(product.price, discount);
			if (discountAmount > maxDiscountAmount) {
				maxDiscountAmount = discountAmount;
				bestDiscount = discount;
			}
		}

		if (bestDiscount) {
			if (bestDiscount.valueType === DiscountValueType.PERCENTAGE) {
				const discountValue = typeof bestDiscount.discountValue === 'string' 
					? parseFloat(bestDiscount.discountValue) 
					: bestDiscount.discountValue;
				return `-${discountValue}%`;
			} else {
				return `-Nu. ${Math.round(maxDiscountAmount)}`;
			}
		}
		return '';
	}

	getDiscountConstraintMessage(product: Product): string | null {
		if (!product) {
			return null;
		}

		const activeDiscounts = this.getActiveDiscounts(product);
		if (activeDiscounts.length === 0) {
			return null;
		}

		// Get current cart items to calculate total for this product
		const currentCartItems = this.cartService.getCartItems();
		const existingItem = currentCartItems.find(item => item.product.id === product.id);
		const currentQuantity = existingItem ? existingItem.quantity : 0;
		const cartTotalForProduct = product.price * (currentQuantity + this.quantity);

		// Check each discount for constraints that prevent it from being applied
		for (const discount of activeDiscounts) {
			// Check minimum order value constraint
			if (discount.minOrderValue !== null && discount.minOrderValue !== undefined) {
				if (cartTotalForProduct < discount.minOrderValue) {
					const amountNeeded = discount.minOrderValue - cartTotalForProduct;
					return `Add Nu. ${Math.ceil(amountNeeded)} more to apply this discount`;
				}
			}

			// Check usage limits
			if (discount.maxUsageCount !== null && discount.maxUsageCount !== undefined) {
				if (discount.usageCount >= discount.maxUsageCount) {
					return 'Discount usage limit reached';
				}
			}
		}

		return null;
	}

	navigateToCatalog() {
		this.router.navigate(['/products']);
	}
}
