import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../../core/dataservice/product/product.service';
import { Product as ServiceProduct } from '../../../core/dataservice/product/product.interface';
import { ImageUtilityService } from '../../../core/utility/image-utility.service';
import { CartService } from '../../../core/services/cart.service';
import { Discount, DiscountValueType, DiscountType, DiscountProduct } from '../../../core/dataservice/discount/discount.interface';
import { ProductSubCategoryService } from '../../../core/dataservice/product-sub-category/product-sub-category.service';
import { ProductSubCategory } from '../../../core/dataservice/product-category/product-category.interface';
import { discountCalculationService, Product as ServiceProductForDiscount, DiscountCalculationOptions, ProductDiscountResult, Discount as ServiceDiscount } from '../../../core/services/discount-calculation-frontend.service';


// Product interface for carousel display
export interface Product {
	id: string;
	title: string;
	shortDescription: string;
	detailedDescription?: string;
	image: string;
	images?: string[];
	dimensions: string;
	weight: number;
	price: number;
	originalPrice?: number;
	category: string;
	subcategory?: string;
	material: string;
	status: 'in-stock' | 'made-to-order' | 'out-of-stock';
	rating?: number;
	reviewCount?: number;
	isFeatured: boolean;
	isNewArrival?: boolean;
	isBestSelling?: boolean;
	createdAt: Date;
	discount?: any;
	discountPercentage?: number;
}

@Component({
	selector: 'app-product-carousel',
	templateUrl: './product-carousel.component.html',
	styleUrls: ['./product-carousel.component.scss'],
	standalone: true,
	imports: [CommonModule, CarouselModule, ToastModule],
	providers: [MessageService],
})
export class ProductCarouselComponent implements OnInit {
	featuredProducts: Product[] = [];
	numVisible: number = 4;

	responsiveOptions = [
		{
			breakpoint: '1200px',
			numVisible: 3,
			numScroll: 1,
		},
		{
			breakpoint: '768px',
			numVisible: 2,
			numScroll: 1,
		},
		{
			breakpoint: '560px',
			numVisible: 1,
			numScroll: 1,
		},
	];

	loading: boolean = false;
	subCategories: ProductSubCategory[] = [];
	allDiscounts: Discount[] = [];

	constructor(
		private router: Router,
		private productService: ProductService,
		private imageUtilityService: ImageUtilityService,
		private cartService: CartService,
		private messageService: MessageService,
		private subCategoryService: ProductSubCategoryService
	) {}

	ngOnInit() {
		this.loadSubCategories();
		this.loadFeaturedProducts();
	}

	loadSubCategories() {
		this.subCategoryService.getSubCategories().subscribe({
			next: (data) => {
				this.subCategories = data.filter(sub => sub.isActive);
			},
			error: (error) => {
				console.error('Error loading subcategories:', error);
				this.subCategories = [];
			}
		});
	}

	/**
	 * Load featured products from API
	 */
	loadFeaturedProducts() {
		this.loading = true;
		this.productService.getFeaturedProducts().subscribe({
			next: (products: ServiceProduct[]) => {
				// Extract all discounts from products
				this.extractDiscountsFromProducts(products);
				
				this.featuredProducts = products.map((product) =>
					this.mapServiceProductToCarouselProduct(product)
				);
				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading featured products:', error);
				this.featuredProducts = [];
				this.loading = false;
			},
		});
	}

	/**
	 * Extract all unique discounts from products
	 */
	private extractDiscountsFromProducts(products: ServiceProduct[]): void {
		const discountMap = new Map<number, Discount>();
		
		products.forEach(product => {
			if (product.discountProducts && product.discountProducts.length > 0) {
				product.discountProducts.forEach((dp: any) => {
					const discount = dp.discount;
					if (discount && typeof discount === 'object' && discount.id) {
						// Normalize discount structure
						const normalizedDiscount: Discount = {
							...discount,
							// Ensure productIds, categoryIds, subCategoryIds are populated
							productIds: discount.productIds || (discount.discountProducts?.map((p: any) => p.productId)),
							categoryIds: discount.categoryIds || (discount.discountCategories?.map((c: any) => c.categoryId)),
							subCategoryIds: discount.subCategoryIds || (discount.discountSubcategories?.map((s: any) => s.subCategoryId)),
						};
						discountMap.set(discount.id, normalizedDiscount);
					}
				});
			}
		});
		
		this.allDiscounts = Array.from(discountMap.values());
	}

	/**
	 * Map service Product to carousel Product format
	 */
	private mapServiceProductToCarouselProduct(
		product: ServiceProduct
	): Product {
		// Get primary image URL
		const primaryImageUrl = this.imageUtilityService.getPrimaryImageUrl(
			product.images
		);

		// Determine status based on availability
		let status: 'in-stock' | 'made-to-order' | 'out-of-stock' = 'in-stock';
		if (!product.isAvailable) {
			status = 'out-of-stock';
		}

		// Check if product is new (created within last 30 days)
		const createdAt = new Date(product.createdAt);
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const isNewArrival = createdAt >= thirtyDaysAgo;

		// Check if product is best selling (salesCount > 10)
		const isBestSelling = product.salesCount > 10;

		// Calculate discounted price
		const discountInfo = this.calculateDiscountedPrice(product);
		const finalPrice = discountInfo.discountedPrice;
		const hasDiscount = discountInfo.bestDiscount !== null;

		return {
			id: product.id.toString(),
			title: product.title,
			shortDescription: product.shortDescription,
			detailedDescription: product.detailedDescription ?? undefined,
			image: primaryImageUrl,
			images: product.images?.map((img) =>
				this.imageUtilityService.getImageUrl(img.imagePath)
			),
			dimensions: product.dimensions,
			weight: product.weight,
			price: finalPrice,
			originalPrice: hasDiscount ? product.price : undefined,
			category: product.productSubCategory?.productCategory?.name || 'uncategorized',
			subcategory: product.productSubCategory?.name || '',
			material: product.material ?? '',
			status: status,
			rating: product.rating || 0,
			reviewCount: 0, // Review count not available in Product interface
			isFeatured: product.isFeatured,
			isNewArrival: isNewArrival,
			isBestSelling: isBestSelling,
			createdAt: createdAt,
			discount: discountInfo.bestDiscount,
			discountPercentage: discountInfo.discountPercentage,
		};
	}

	/**
	 * Handle image loading errors
	 */
	onImageError(event: any) {
		// Set a placeholder image when the original fails to load
		event.target.src = 'product-placeholder.png';
	}

	/**
	 * Get status label for display
	 */
	getStatusLabel(status: string): string {
		switch (status) {
			case 'in-stock':
				return 'In Stock';
			case 'made-to-order':
				return 'Made to Order';
			case 'out-of-stock':
				return 'Out of Stock';
			default:
				return 'Available';
		}
	}

	/**
	 * Navigate to product details
	 */
	viewProduct(productId: string) {
		this.router.navigate(['/products', productId]);
	}

	/**
	 * Navigate to all products page
	 */
	viewAllProducts() {
		this.router.navigate(['/products']);
	}

	/**
	 * Add product to cart
	 */
	addToCart(product: Product, event?: Event) {
		if (event) {
			event.stopPropagation();
		}

		// Convert carousel Product to ServiceProduct format
		const serviceProduct: ServiceProduct = {
			id: parseInt(product.id),
			title: product.title,
			shortDescription: product.shortDescription,
			detailedDescription: product.detailedDescription ?? '',
			dimensions: product.dimensions,
			weight: product.weight,
			price: product.originalPrice || product.price, // Use original price if available
			material: product.material,
			isAvailable: product.status === 'in-stock',
			productSubCategoryId: 0, // Will be set if needed
			rating: product.rating || 0,
			salesCount: 0,
			isFeatured: product.isFeatured,
			images: product.images?.map((img, index) => ({
				id: index,
				productId: parseInt(product.id),
				imagePath: img,
				fileName: `product-${product.id}-${index}.jpg`,
				orientation: 'square' as const,
				isPrimary: index === 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			})) || [],
			createdAt: product.createdAt,
			updatedAt: product.createdAt,
		};

		// Add to cart with discount information if available
		const discount = product.discount || null;
		this.cartService.addToCart(serviceProduct, 1, discount);

		// Show success message
		this.messageService.add({
			severity: 'success',
			summary: 'Added to Cart',
			detail: `${product.title} has been added to your cart`,
			life: 3000,
		});
	}

	/**
	 * Calculate discounted price for a product
	 */
	private calculateDiscountedPrice(product: ServiceProduct): {
		discountedPrice: number;
		discountPercentage: number;
		bestDiscount: Discount | null;
	} {
		// Get applicable discounts for this product
		const applicableDiscounts = this.getApplicableDiscountsForProduct(product);
		
		if (applicableDiscounts.length === 0) {
			return {
				discountedPrice: product.price,
				discountPercentage: 0,
				bestDiscount: null,
			};
		}

		// Get category ID for the product
		let categoryId: number | undefined;
		if (product.productSubCategory?.productCategoryId) {
			categoryId = product.productSubCategory.productCategoryId;
		} else if (product.productSubCategoryId) {
			const subCategory = this.subCategories.find(sub => sub.id === product.productSubCategoryId);
			categoryId = subCategory?.productCategoryId;
		}

		// Use discount calculation service
		const productForDiscount: ServiceProductForDiscount = {
			id: product.id!,
			price: product.price,
			productSubCategoryId: product.productSubCategoryId,
			productCategoryId: categoryId,
		};

		const options: DiscountCalculationOptions = {
			voucherCode: null,
			currentDate: new Date(),
		};

		// Convert discounts to service format
		const serviceDiscounts: ServiceDiscount[] = applicableDiscounts.map(d => ({
			...d,
			maxUsageCount: d.maxUsageCount ?? null,
			minOrderValue: d.minOrderValue ?? null,
			voucherCode: d.voucherCode ?? null,
			discountValue: typeof d.discountValue === 'string' ? parseFloat(d.discountValue) : d.discountValue,
		}));

		const result: ProductDiscountResult = discountCalculationService.getDiscount(
			productForDiscount,
			serviceDiscounts,
			options
		);

		if (result.discountsApplied.length > 0 && result.newPrice < product.price) {
			// Calculate discount percentage
			const discountAmount = product.price - result.newPrice;
			const discountPercentage = (discountAmount / product.price) * 100;

			// Convert back to original Discount type for return
			const bestDiscount: Discount | null = result.discountsApplied.length > 0 
				? {
					...result.discountsApplied[0],
					discountValue: typeof result.discountsApplied[0].discountValue === 'string' 
						? parseFloat(result.discountsApplied[0].discountValue) 
						: result.discountsApplied[0].discountValue,
				} as Discount
				: null;

			return {
				discountedPrice: result.newPrice,
				discountPercentage: Math.round(discountPercentage),
				bestDiscount: bestDiscount,
			};
		}

		// No discount applied
		return {
			discountedPrice: product.price,
			discountPercentage: 0,
			bestDiscount: null,
		};
	}

	/**
	 * Get applicable discounts for a product
	 */
	private getApplicableDiscountsForProduct(product: ServiceProduct): Discount[] {
		if (!product || this.allDiscounts.length === 0) {
			return [];
		}

		// Get category ID for the product
		let categoryId: number | undefined;
		if (product.productSubCategory?.productCategoryId) {
			categoryId = product.productSubCategory.productCategoryId;
		} else if (product.productSubCategoryId) {
			const subCategory = this.subCategories.find(sub => sub.id === product.productSubCategoryId);
			categoryId = subCategory?.productCategoryId;
		}

		const applicableDiscounts = this.allDiscounts.filter(discount => {
			// Check if discount applies to this product
			switch (discount.discountType) {
				case DiscountType.FLAT_ALL_PRODUCTS:
					return true;
				case DiscountType.FLAT_SELECTED_PRODUCTS:
					return discount.productIds?.includes(product.id) || false;
				case DiscountType.FLAT_SELECTED_CATEGORIES:
					const categoryMatch = categoryId && discount.categoryIds?.includes(categoryId);
					const subCategoryMatch = discount.subCategoryIds?.includes(product.productSubCategoryId);
					return categoryMatch || subCategoryMatch || false;
				default:
					return false;
			}
		});

		// Filter by constraints (active, date range, voucher code, min order value)
		const currentDate = new Date();
		return applicableDiscounts.filter(discount => {
			// Check if discount is active
			if (!discount.isActive) {
				return false;
			}

			// Check date range
			const startDate = new Date(discount.startDate);
			const endDate = new Date(discount.endDate);
			if (currentDate < startDate || currentDate > endDate) {
				return false;
			}

			// For auto-apply discounts (no voucher code), only include those without voucher code
			if (discount.voucherCode) {
				return false; // Don't auto-apply voucher code discounts
			}

			// Check minimum order value - for single product, use product price
			if (discount.minOrderValue !== null && discount.minOrderValue !== undefined) {
				if (product.price < discount.minOrderValue) {
					return false;
				}
			}

			// Check usage limits
			if (discount.maxUsageCount !== null && discount.maxUsageCount !== undefined) {
				if (discount.usageCount >= discount.maxUsageCount) {
					return false;
				}
			}

			return true;
		});
	}

	


}
