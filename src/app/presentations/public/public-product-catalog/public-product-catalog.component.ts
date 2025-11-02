import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
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
	],
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
	selectedMaterial = '';
	selectedAvailability = '';
	priceRangeFilter = '';
	sortOption = 'newest';

	// Pagination
	currentPage = 0;
	itemsPerPage = 12;
	totalPages = 0;

	// View Options
	viewMode: 'grid' | 'list' = 'grid';

	// Filter Options
	materialOptions = [
		{ label: 'All Materials', value: '' },
		{ label: 'PLA', value: 'PLA' },
		{ label: 'ABS', value: 'ABS' },
		{ label: 'PETG', value: 'PETG' },
		{ label: 'TPU', value: 'TPU' },
		{ label: 'Wood Filament', value: 'Wood' },
		{ label: 'Metal Filament', value: 'Metal' },
		{ label: 'Resin', value: 'Resin' },
	];

	availabilityOptions = [
		{ label: 'All Products', value: '' },
		{ label: 'In Stock', value: 'available' },
		{ label: 'Made to Order', value: 'unavailable' },
	];

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
		private router: Router,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCategories();
		this.loadSubCategories();
		this.loadMockProducts();
	}

	// Data Loading Methods
	loadCategories() {
		// Mock categories data
		this.categories = [
			{
				id: 1,
				name: 'Religious Statues',
				description: 'Buddha statues and religious figurines',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 2,
				name: 'Stupas & Monuments',
				description: 'Traditional Bhutanese stupas and monuments',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 3,
				name: 'Prayer Items',
				description: 'Prayer wheels and spiritual accessories',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 4,
				name: 'Decorative Art',
				description: 'Mandalas and wall decorations',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 5,
				name: 'Ritual Items',
				description: 'Incense holders and ritual accessories',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];
		this.cdr.markForCheck();
	}

	loadSubCategories() {
		// Mock subcategories data
		this.subCategories = [
			{
				id: 1,
				name: 'Buddha Statues',
				description: 'Various Buddha statue designs',
				productCategoryId: 1,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 2,
				name: 'Traditional Stupas',
				description: 'Classic stupa designs',
				productCategoryId: 2,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 3,
				name: 'Prayer Wheels',
				description: 'Spinning prayer wheels',
				productCategoryId: 3,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 4,
				name: 'Mandala Art',
				description: 'Sacred geometric patterns',
				productCategoryId: 4,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 5,
				name: 'Incense Holders',
				description: 'Functional incense accessories',
				productCategoryId: 5,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];
		this.filteredSubCategories = this.subCategories;
		this.cdr.markForCheck();
	}

	loadMockProducts() {
		this.loading = true;
		this.cdr.markForCheck();

		// Simulate loading delay
		setTimeout(() => {
			// Mock product data
			this.products = [
				{
					id: 1,
					title: 'Jangchub Chorten - Traditional Design',
					shortDescription:
						'Beautifully crafted 3D printed Jangchub Chorten with intricate traditional details',
					detailedDescription:
						'This magnificent Jangchub Chorten represents enlightenment and spiritual awakening. Carefully designed with authentic Bhutanese architectural elements and sacred proportions.',
					dimensions: '15cm x 10cm x 8cm',
					weight: 0.5,
					price: 12750,
					material: 'PLA',
					stockQuantity: 10,
					isAvailable: true,
					productSubCategoryId: 1,
					rating: 4.8,
					salesCount: 25,
					images: [
						{
							id: 1,
							productId: 1,
							imagePath: 'products/jangchub chorten.png',
							fileName: 'jangchub chorten.png',
							orientation: 'portrait' as const,
							isPrimary: true,
							altText: 'Jangchub Chorten - Traditional Design',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					],
					createdAt: new Date('2024-01-15'),
					updatedAt: new Date('2024-01-15'),
				},
				{
					id: 2,
					title: 'Memorial Chorten - Sacred Monument',
					shortDescription:
						'Authentic replica of Bhutanese memorial chorten architecture',
					detailedDescription:
						'A precise reproduction of sacred Bhutanese memorial chorten design, perfect for meditation spaces and spiritual practice.',
					dimensions: '12cm x 12cm x 18cm',
					weight: 0.7,
					price: 16150,
					material: 'PETG',
					stockQuantity: 0,
					isAvailable: false,
					productSubCategoryId: 2,
					rating: 4.9,
					salesCount: 18,
					images: [
						{
							id: 2,
							productId: 2,
							imagePath: 'products/memorial-chorten.png',
							fileName: 'memorial-chorten.png',
							orientation: 'portrait' as const,
							isPrimary: true,
							altText: 'Memorial Chorten - Sacred Monument',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					],
					createdAt: new Date('2024-01-10'),
					updatedAt: new Date('2024-01-10'),
				},
				{
					id: 3,
					title: 'Chorten Collection - Mini Set',
					shortDescription:
						'Set of miniature chortens with traditional Bhutanese design',
					detailedDescription:
						'Handcrafted miniature chorten collection featuring sacred architectural elements and traditional proportions.',
					dimensions: '5cm x 5cm x 8cm (each)',
					weight: 0.2,
					price: 6800,
					material: 'Resin',
					stockQuantity: 15,
					isAvailable: true,
					productSubCategoryId: 3,
					rating: 4.7,
					salesCount: 42,
					images: [
						{
							id: 3,
							productId: 3,
							imagePath: 'products/chorten2.png',
							fileName: 'chorten2.png',
							orientation: 'landscape' as const,
							isPrimary: true,
							altText: 'Chorten Collection - Mini Set',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					],
					createdAt: new Date('2024-01-08'),
					updatedAt: new Date('2024-01-08'),
				},
				{
					id: 4,
					title: 'Dochula Chorten - Victory Monument',
					shortDescription:
						'Elegant representation of the famous Dochula Pass chorten',
					detailedDescription:
						'A beautiful replica of the iconic Dochula Pass chorten, representing victory over negative forces and spiritual protection.',
					dimensions: '10cm x 6cm x 12cm',
					weight: 0.3,
					price: 8500,
					material: 'Wood',
					stockQuantity: 8,
					isAvailable: true,
					productSubCategoryId: 1,
					rating: 4.6,
					salesCount: 31,
					images: [
						{
							id: 4,
							productId: 4,
							imagePath: 'products/dochula chorten.png',
							fileName: 'dochula chorten.png',
							orientation: 'portrait' as const,
							isPrimary: true,
							altText: 'Dochula Chorten - Victory Monument',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					],
					createdAt: new Date('2024-01-05'),
					updatedAt: new Date('2024-01-05'),
				},
				{
					id: 5,
					title: 'Dechenphug Lhakhang - Temple Model',
					shortDescription: 'Sacred temple architecture in miniature form',
					detailedDescription:
						'Intricate Lhakhang (temple) model designed for spiritual decoration and meditation focus, featuring traditional Bhutanese architectural elements.',
					dimensions: '20cm x 20cm x 2cm',
					weight: 0.4,
					price: 11050,
					material: 'ABS',
					stockQuantity: 12,
					isAvailable: true,
					productSubCategoryId: 4,
					rating: 4.8,
					salesCount: 19,
					images: [
						{
							id: 5,
							productId: 5,
							imagePath: 'products/dechenphug lhakhang.png',
							fileName: 'dechenphug lhakhang.png',
							orientation: 'square' as const,
							isPrimary: true,
							altText: 'Dechenphug Lhakhang - Temple Model',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					],
					createdAt: new Date('2024-01-03'),
					updatedAt: new Date('2024-01-03'),
				},
				{
					id: 6,
					title: 'Traditional Chorten - Compact Design',
					shortDescription:
						'Beautiful compact chorten with traditional proportions',
					detailedDescription:
						'Functional and decorative traditional chorten with authentic proportions, perfect for personal altars and meditation spaces.',
					dimensions: '8cm x 8cm x 3cm',
					weight: 0.15,
					price: 3400,
					material: 'TPU',
					stockQuantity: 25,
					isAvailable: true,
					productSubCategoryId: 5,
					rating: 4.5,
					salesCount: 67,
					images: [
						{
							id: 6,
							productId: 6,
							imagePath: 'products/chorten22.png',
							fileName: 'chorten22.png',
							orientation: 'landscape' as const,
							isPrimary: true,
							altText: 'Traditional Chorten - Compact Design',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					],
					createdAt: new Date('2024-01-01'),
					updatedAt: new Date('2024-01-01'),
				},
			];

			// Apply filters to mock data
			this.filteredProducts = this.applyFilters(this.products);
			this.totalProducts = this.filteredProducts.length;
			this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);

			// Apply pagination
			const startIndex = this.currentPage * this.itemsPerPage;
			const endIndex = startIndex + this.itemsPerPage;
			this.products = this.filteredProducts.slice(startIndex, endIndex);

			this.loading = false;
			this.cdr.markForCheck();
		}, 800); // Simulate loading delay
	}

	private applyFilters(products: Product[]): Product[] {
		let filtered = [...products];

		// Search filter
		if (this.searchTerm) {
			const searchTerm = this.searchTerm.toLowerCase();
			filtered = filtered.filter(
				(product) =>
					product.title.toLowerCase().includes(searchTerm) ||
					product.shortDescription.toLowerCase().includes(searchTerm) ||
					product.material.toLowerCase().includes(searchTerm)
			);
		}

		// Material filter
		if (this.selectedMaterial) {
			filtered = filtered.filter(
				(product) => product.material === this.selectedMaterial
			);
		}

		// Availability filter
		const availabilityFilter = this.getAvailabilityFilter();
		if (availabilityFilter !== undefined) {
			filtered = filtered.filter(
				(product) => product.isAvailable === availabilityFilter
			);
		}

		// Price range filter
		const priceRange = this.getPriceRange();
		if (priceRange.minPrice !== undefined) {
			filtered = filtered.filter(
				(product) => product.price >= priceRange.minPrice!
			);
		}
		if (priceRange.maxPrice !== undefined) {
			filtered = filtered.filter(
				(product) => product.price <= priceRange.maxPrice!
			);
		}

		// Sort products
		filtered.sort((a, b) => {
			const sortField = this.getSortField();
			const sortOrder = this.getSortOrder();

			let aValue: any, bValue: any;

			switch (sortField) {
				case 'price':
					aValue = a.price;
					bValue = b.price;
					break;
				case 'title':
					aValue = a.title.toLowerCase();
					bValue = b.title.toLowerCase();
					break;
				case 'createdDate':
				default:
					aValue = new Date(a.createdAt);
					bValue = new Date(b.createdAt);
					break;
			}

			if (sortOrder === 'ASC') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filtered;
	}

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

		this.resetPagination();
		this.loadMockProducts();
	}

	onSubCategoryChange() {
		this.resetPagination();
		this.loadMockProducts();
	}

	onMaterialChange() {
		this.resetPagination();
		this.loadMockProducts();
	}

	onAvailabilityChange() {
		this.resetPagination();
		this.loadMockProducts();
	}

	onPriceRangeChange() {
		this.resetPagination();
		this.loadMockProducts();
	}

	onSortChange() {
		this.resetPagination();
		this.loadMockProducts();
	}

	onSearch() {
		this.resetPagination();
		this.loadMockProducts();
	}

	clearFilters() {
		this.searchTerm = '';
		this.selectedCategoryId = null;
		this.selectedSubCategoryId = null;
		this.selectedMaterial = '';
		this.selectedAvailability = '';
		this.priceRangeFilter = '';
		this.sortOption = 'newest';
		this.filteredSubCategories = this.subCategories;
		this.resetPagination();
		this.loadMockProducts();
	}

	// Pagination Methods
	onPageChange(event: any) {
		this.currentPage = event.page;
		this.loadMockProducts();
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
		// Custom formatting for Bhutanese Ngultrum (BTN)
		return `Nu ${new Intl.NumberFormat('en-BT', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)}`;
	}

	// Helper Methods
	private getAvailabilityFilter(): boolean | undefined {
		if (this.selectedAvailability === 'available') return true;
		if (this.selectedAvailability === 'unavailable') return false;
		return undefined;
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

		const [min, max] = this.priceRangeFilter.split('-');
		const result: { minPrice?: number; maxPrice?: number } = {};

		if (min && min !== '15000+') {
			result.minPrice = parseInt(min);
		}
		if (max) {
			result.maxPrice = parseInt(max);
		} else if (this.priceRangeFilter === '15000+') {
			result.minPrice = 15000;
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
