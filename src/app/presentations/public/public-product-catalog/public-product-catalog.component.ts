import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';

// Data Services
import { ProductService } from '../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../core/dataservice/product-sub-category/product-sub-category.service';
import {
	Product,
	ProductQueryDto,
} from '../../../core/dataservice/product/product.interface';
import {
	ProductCategory,
	ProductSubCategory,
} from '../../../core/dataservice/product-category/product-category.interface';
import { ImageUtilityService } from '../../../core/utility/image-utility.service';
import { CartService } from '../../../core/services/cart.service';
import { Discount, DiscountValueType, DiscountType, DiscountScope, DiscountProduct } from '../../../core/dataservice/discount/discount.interface';
import { MessageService } from 'primeng/api';

@Component({
	selector: 'app-public-product-catalog',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		DropdownModule,
		InputTextModule,
		PaginatorModule,
		SkeletonModule,
		TagModule,
		TooltipModule,
		ToastModule,
		SelectButtonModule,
		SidebarModule,
	],
	providers: [MessageService],
	templateUrl: './public-product-catalog.component.html',
	styleUrls: ['./public-product-catalog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProductCatalogComponent implements OnInit {
	// Products Data
	products: Product[] = [];
	filteredProducts: Product[] = [];
	totalProducts = 0;
	loading = false;

	// Categories Data
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];
	filteredSubCategories: ProductSubCategory[] = [];

	// Filter State
	searchTerm = '';
	selectedCategoryId: number | null = null;
	selectedSubCategoryId: number | null = null;
	priceRangeFilter = '';
	sortOption = 'newest';

	// Mobile: filters in p-sidebar; isMobile for auto-close on filter change (optional)
	isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

	// Mobile: PrimeNG sidebar for filters (opened via Filters button)
	filtersSidebarVisible = false;

	// Pagination
	currentPage = 0;
	itemsPerPage = 12;
	totalPages = 0;

	// View Options
	viewMode: 'grid' | 'list' = 'grid';
	viewToggleOptions = [
		{ label: '', icon: 'pi pi-th-large', value: 'grid', title: 'Grid View' },
		{ label: '', icon: 'pi pi-list', value: 'list', title: 'List View' },
	];

	// Filter Options
	priceRangeOptions = [
		{ label: 'All Prices', value: '' },
		{ label: 'Under Nu 5,000', value: '0-5000' },
		{ label: 'Nu 5,000 - 10,000', value: '5000-10000' },
		{ label: 'Nu 10,000 - 15,000', value: '10000-15000' },
		{ label: 'Over Nu 15,000', value: '15000+' },
	];

	sortOptions = [
		{ label: 'Newest First', value: 'newest' },
		{ label: 'Price: Low to High', value: 'price-asc' },
		{ label: 'Price: High to Low', value: 'price-desc' },
		{ label: 'Name: A to Z', value: 'name-asc' },
		{ label: 'Name: Z to A', value: 'name-desc' },
	];

	constructor(
		private productService: ProductService,
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private imageUtilityService: ImageUtilityService,
		private cartService: CartService,
		private messageService: MessageService,
		private router: Router,
		private cdr: ChangeDetectorRef
	) {}

	@HostListener('window:resize')
	onResize() {
		const m = typeof window !== 'undefined' && window.innerWidth < 1024;
		if (m !== this.isMobile) {
			this.isMobile = m;
			this.cdr.markForCheck();
		}
	}

	ngOnInit() {
		this.isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
		this.loadCategories();
		this.loadSubCategories();
		// Products will be loaded after subcategories are loaded
		// If subcategories fail, products will still load
	}

	// Data Loading Methods
	loadCategories() {
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				// Filter only active categories
				this.categories = data.filter(cat => cat.isActive);
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading categories:', error);
				this.categories = [];
				this.cdr.markForCheck();
			},
		});
	}

	loadSubCategories() {
		this.subCategoryService.getSubCategories().subscribe({
			next: (data) => {
				// Filter only active subcategories
				this.subCategories = data.filter(sub => sub.isActive);
				this.filteredSubCategories = this.subCategories;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading subcategories:', error);
				this.subCategories = [];
				this.filteredSubCategories = [];
				this.cdr.markForCheck();
			},
			complete: () => {
				// Load products after subcategories are loaded (whether success or error)
				this.loadProducts();
			}
		});
	}

	loadProducts() {
		this.loading = true;
		this.cdr.markForCheck();

		// Build query parameters
		const query: ProductQueryDto = {
			search: this.searchTerm || undefined,
			sortBy: this.mapSortOptionToQuery(this.sortOption),
		};

		this.productService.getProducts(query).subscribe({
			next: (data) => {
				// Store all products
				let allProducts = data;

				// Apply category filter client-side if selected
				// When a category is selected, filter by all subcategories in that category
				if (this.selectedCategoryId && !this.selectedSubCategoryId) {
					const categorySubCategoryIds = this.subCategories
						.filter(sub => sub.productCategoryId === this.selectedCategoryId)
						.map(sub => sub.id);
					
					allProducts = allProducts.filter(
						product => categorySubCategoryIds.includes(product.productSubCategoryId)
					);
				}

				// Apply subcategory filter client-side if selected
				if (this.selectedSubCategoryId) {
					allProducts = allProducts.filter(
						product => product.productSubCategoryId === this.selectedSubCategoryId
					);
				}

				// Apply price range filter client-side
				allProducts = this.applyPriceRangeFilter(allProducts);

				// Store all filtered products
				this.filteredProducts = allProducts;
				this.totalProducts = allProducts.length;
				this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);

				// Apply pagination
				this.updatePaginatedProducts();

				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading products:', error);
				this.products = [];
				this.filteredProducts = [];
				this.totalProducts = 0;
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	private mapSortOptionToQuery(sortOption: string): ProductQueryDto['sortBy'] {
		const sortMap: { [key: string]: ProductQueryDto['sortBy'] } = {
			'newest': 'newest',
			'price-asc': 'price_asc',
			'price-desc': 'price_desc',
		};
		return sortMap[sortOption] || 'newest';
	}

	private applyPriceRangeFilter(products: Product[]): Product[] {
		if (!this.priceRangeFilter) return products;

		const priceRange = this.getPriceRange();
		return products.filter((product) => {
			const productPrice = product.price;
			
			// Check minimum price
			if (priceRange.minPrice !== undefined && productPrice < priceRange.minPrice) {
				return false;
			}
			
			// Check maximum price
			if (priceRange.maxPrice !== undefined && productPrice > priceRange.maxPrice) {
				return false;
			}
			
			return true;
		});
	}

	private updatePaginatedProducts() {
		const startIndex = this.currentPage * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;
		this.products = this.filteredProducts.slice(startIndex, endIndex);
	}

	// Filtering is now done via API, but we keep this for client-side price range filtering

	// Filter Methods
	onCategoryChange(categoryId: number | null) {
		this.selectedCategoryId = categoryId;
		this.selectedSubCategoryId = null;
		if (categoryId) {
			this.filteredSubCategories = this.subCategories.filter(
				(sub) => sub.productCategoryId === categoryId
			);
		} else {
			this.filteredSubCategories = this.subCategories;
		}
		if (this.isMobile) {
			this.filtersSidebarVisible = false;
			this.cdr.markForCheck();
		}
		this.resetPagination();
		this.loadProducts();
	}

	onSubCategoryChange() {
		if (this.selectedSubCategoryId) {
			const subCategory = this.subCategories.find(
				sub => sub.id === this.selectedSubCategoryId
			);
			if (subCategory && this.selectedCategoryId !== subCategory.productCategoryId) {
				this.selectedCategoryId = subCategory.productCategoryId;
				this.filteredSubCategories = this.subCategories.filter(
					(sub) => sub.productCategoryId === this.selectedCategoryId
				);
			}
		}
		if (this.isMobile) {
			this.filtersSidebarVisible = false;
			this.cdr.markForCheck();
		}
		this.resetPagination();
		this.loadProducts();
	}

	onPriceRangeChange() {
		if (this.isMobile) {
			this.filtersSidebarVisible = false;
			this.cdr.markForCheck();
		}
		this.resetPagination();
		this.loadProducts();
	}

	onSortChange() {
		this.resetPagination();
		this.loadProducts();
	}

	onSearch() {
		if (this.isMobile) {
			this.filtersSidebarVisible = false;
			this.cdr.markForCheck();
		}
		this.resetPagination();
		this.loadProducts();
	}

	openFiltersSidebar() {
		this.filtersSidebarVisible = true;
		this.cdr.markForCheck();
	}

	clearFilters() {
		this.searchTerm = '';
		this.selectedCategoryId = null;
		this.selectedSubCategoryId = null;
		this.priceRangeFilter = '';
		this.sortOption = 'newest';
		this.filteredSubCategories = this.subCategories;
		if (this.isMobile) {
			this.filtersSidebarVisible = false;
			this.cdr.markForCheck();
		}
		this.resetPagination();
		this.loadProducts();
	}

	/**
	 * Check if any filters are active
	 */
	hasActiveFilters(): boolean {
		return !!(
			this.searchTerm ||
			this.selectedCategoryId ||
			this.selectedSubCategoryId ||
			this.priceRangeFilter
		);
	}

	/**
	 * Get count of active filters
	 */
	getActiveFilterCount(): number {
		let count = 0;
		if (this.searchTerm) count++;
		if (this.selectedCategoryId) count++;
		if (this.selectedSubCategoryId) count++;
		if (this.priceRangeFilter) count++;
		return count;
	}

	// Pagination Methods
	onPageChange(event: any) {
		this.currentPage = event.page;
		this.updatePaginatedProducts();
		this.cdr.markForCheck();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	resetPagination() {
		this.currentPage = 0;
	}

	// View Methods
	toggleViewMode() {
		this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
	}

	// Product Methods
	viewProductDetails(productId: number) {
		this.router.navigate(['/products', productId]);
	}

	addToCart(product: Product, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		
		// Get current cart items to calculate total for this product
		const currentCartItems = this.cartService.getCartItems();
		const existingItem = currentCartItems.find(item => item.product.id === product.id);
		const currentQuantity = existingItem ? existingItem.quantity : 0;
		const newQuantity = currentQuantity + 1;
		
		// Get discount info based on the new quantity (cart total for this product)
		const discountInfo = this.getDiscountInfo(product, newQuantity);
		
		// Only apply discount if it can be applied (constraints met)
		const discount = discountInfo.canApply ? discountInfo.bestDiscount : null;
		
		// Add to cart with discount information (only if can be applied)
		this.cartService.addToCart(product, 1, discount);
		
		this.messageService.add({
			severity: 'success',
			summary: 'Added to Cart',
			detail: `${product.title} has been added to your cart`,
			life: 3000,
		});
		
		this.cdr.markForCheck();
	}

	getPrimaryImage(product: Product): string {
		return this.imageUtilityService.getPrimaryImageUrl(product.images);
	}



	getCategoryName(subCategoryId: number): string {
		const subCategory = this.subCategories.find(
			(sub) => sub.id === subCategoryId
		);
		if (subCategory) {
			const category = this.categories.find(
				(cat) => cat.id === subCategory.productCategoryId
			);
			return category?.name || '';
		}
		return '';
	}

	getSubCategoryName(subCategoryId: number): string {
		const subCategory = this.subCategories.find(
			(sub) => sub.id === subCategoryId
		);
		return subCategory?.name || '';
	}

	formatPrice(price: number): string {
		// Format price with decimals preserved
		return `Nu ${price.toFixed(2)}`;
	}



	// Discount helper methods - matching admin-list-products approach
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
			.map((dp: DiscountProduct) => dp.discount)
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
		// Show discount badge even if constraint not met (for display purposes)
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
				// For fixed amount, show the actual discount amount
				return `-Nu. ${Math.round(maxDiscountAmount)}`;
			}
		}
		return '';
	}

	/**
	 * Get constraint message for a product's discount
	 * Shows why discount cannot be applied (e.g., minimum order value)
	 */
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
		const cartTotalForProduct = product.price * (currentQuantity + 1); // Include the item being viewed

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

	/**
	 * Check if discount requires voucher code
	 */
	requiresVoucherCode(product: Product): boolean {
		if (!product) {
			return false;
		}

		const activeDiscounts = this.getActiveDiscounts(product);
		// Check if any discount requires a voucher code
		return activeDiscounts.some(discount => discount.voucherCode !== null);
	}

	// Getter methods for dropdown options
	get categoryOptions() {
		return [
			{ label: 'All Categories', value: null },
			...this.categories.map((cat) => ({ label: cat.name, value: cat.id })),
		];
	}

	get subCategoryOptions() {
		return [
			{ label: 'All Sub-Categories', value: null },
			...this.filteredSubCategories.map((sub) => ({
				label: sub.name,
				value: sub.id,
			})),
		];
	}

	private getSortField(): string {
		const sortMap: { [key: string]: string } = {
			price_low: 'price',
			price_high: 'price',
			newest: 'createdDate',
			name_asc: 'title',
			name_desc: 'title',
		};
		return sortMap[this.sortOption] || 'title';
	}
	private getSortOrder(): 'ASC' | 'DESC' {
		switch (this.sortOption) {
			case 'price-asc':
			case 'name-asc':
				return 'ASC';
			default:
				return 'DESC';
		}
	}

	private getPriceRange(): { minPrice?: number; maxPrice?: number } {
		if (!this.priceRangeFilter) return {};

		const result: { minPrice?: number; maxPrice?: number } = {};

		// Handle "15000+" case
		if (this.priceRangeFilter === '15000+') {
			result.minPrice = 15000;
			return result;
		}

		// Handle range like "0-5000", "5000-10000", etc.
		const parts = this.priceRangeFilter.split('-');
		if (parts.length === 2) {
			const min = parts[0].trim();
			const max = parts[1].trim();

			if (min) {
				result.minPrice = parseInt(min, 10);
			}
			if (max) {
				result.maxPrice = parseInt(max, 10);
			}
		}

		return result;
	}

	// Track By Functions for Performance
	trackByProductId(index: number, product: Product): number {
		return product.id || index;
	}

	trackByCategoryId(index: number, category: ProductCategory): number {
		return category.id || index;
	}

	trackBySubCategoryId(index: number, subCategory: ProductSubCategory): number {
		return subCategory.id || index;
	}
}
