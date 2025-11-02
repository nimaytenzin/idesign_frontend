import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';

// Product interface (same as carousel)
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
}

@Component({
	selector: 'app-product-catalog',
	templateUrl: './product-catalog.component.html',
	styleUrls: ['./product-catalog.component.scss'],
	standalone: true,
	imports: [CommonModule, FormsModule, PaginatorModule],
})
export class ProductCatalogComponent implements OnInit {
	// Data properties
	allProducts: Product[] = [];
	filteredProducts: Product[] = [];
	paginatedProducts: Product[] = [];
	loading = false;

	// Filter properties
	searchTerm = '';
	selectedCategory = '';
	selectedMaterials: string[] = [];
	selectedAvailability = '';
	priceRange = { min: null as number | null, max: null as number | null };

	// Sort and view properties
	sortBy = 'featured';
	viewMode: 'grid' | 'list' = 'grid';

	// Pagination properties
	currentPage = 1;
	itemsPerPage = 12;

	// Filter options
	categories = [
		{ value: 'stupas', label: 'Bhutanese Stupas' },
		{ value: 'architecture', label: 'Temple Architecture' },
		{ value: 'sets', label: 'Product Sets' },
		{ value: 'accessories', label: 'Accessories' },
		{ value: 'decorative', label: 'Decorative Art' },
		{ value: 'educational', label: 'Educational Models' },
		{ value: 'custom', label: 'Custom Designs' },
		{ value: 'special', label: 'Special Editions' },
	];

	materials = ['PLA+', 'PETG', 'Resin', 'Wood PLA', 'Metal PLA', 'Ceramic'];

	constructor(private router: Router) {}

	ngOnInit() {
		this.loadProducts();
	}

	/**
	 * Load all products - in real app, this would come from a service
	 */
	loadProducts() {
		this.loading = true;

		// Simulate API call delay
		setTimeout(() => {
			this.allProducts = this.getMockProducts();
			this.applyFilters();
			this.loading = false;
		}, 500);
	}

	/**
	 * Get mock product data
	 */
	getMockProducts(): Product[] {
		return [
			{
				id: 'memorial-chorten-001',
				title: 'Memorial Chorten',
				shortDescription:
					'Traditional memorial stupa with authentic Bhutanese architecture and spiritual significance.',
				detailedDescription:
					'This magnificent memorial chorten represents the traditional Bhutanese architectural style with intricate details and spiritual significance. Perfect for meditation spaces, temples, or as a centerpiece for spiritual practice.',
				image: 'products/memorial-chorten.png',
				images: [
					'products/memorial-chorten.png',
					'products/memorial-chorten side.png',
					'products/memorial-chorten top.png',
				],
				dimensions: '18×18×25 cm',
				weight: 650,
				price: 3500,
				originalPrice: 4000,
				category: 'stupas',
				subcategory: 'memorial',
				material: 'Premium PLA+',
				status: 'in-stock',
				rating: 4.9,
				reviewCount: 32,
				isFeatured: true,
				isBestSelling: true,
				createdAt: new Date('2024-01-15'),
			},
			{
				id: 'dochula-chorten-001',
				title: 'Dochula Chorten',
				shortDescription:
					'Replica of the famous Dochula Pass chorten, capturing the essence of this sacred landmark.',
				detailedDescription:
					'Beautiful replica of the iconic Dochula Pass chorten, capturing the essence of this sacred landmark. Each detail has been carefully preserved from the original architecture.',
				image: 'products/dochula chorten.png',
				images: [
					'products/dochula chorten.png',
					'products/dochula chorten split.png',
				],
				dimensions: '15×15×22 cm',
				weight: 500,
				price: 2800,
				category: 'stupas',
				subcategory: 'landmark',
				material: 'PLA+',
				status: 'in-stock',
				rating: 4.8,
				reviewCount: 28,
				isFeatured: true,
				createdAt: new Date('2024-02-20'),
			},
			{
				id: 'jangchub-chorten-001',
				title: 'Jangchub Chorten',
				shortDescription:
					'Classic Jangchub chorten representing the path to enlightenment, handcrafted with precision.',
				detailedDescription:
					'Classic Jangchub chorten representing the path to enlightenment. This traditional design embodies the spiritual journey and is perfect for meditation practices.',
				image: 'products/jangchub chorten.png',
				images: [
					'products/jangchub chorten.png',
					'products/jangchub chorten 1.png',
					'products/jangchub chorten zung.png',
				],
				dimensions: '12×12×18 cm',
				weight: 400,
				price: 2200,
				category: 'stupas',
				subcategory: 'traditional',
				material: 'PETG',
				status: 'in-stock',
				rating: 4.7,
				reviewCount: 24,
				isFeatured: true,
				isNewArrival: true,
				createdAt: new Date('2024-01-30'),
			},
			{
				id: 'dechenphug-lhakhang-001',
				title: 'Dechenphug Lhakhang Top',
				shortDescription:
					'Detailed replica of Dechenphug Lhakhang temple roof, showcasing traditional Bhutanese temple architecture.',
				detailedDescription:
					'Exquisite replica of Dechenphug Lhakhang temple roof, showcasing the finest details of traditional Bhutanese temple architecture. A perfect piece for cultural appreciation.',
				image: 'products/dechenphug lhakhang top.png',
				images: [
					'products/dechenphug lhakhang top.png',
					'products/dechenphug lhakhang.png',
				],
				dimensions: '14×10×8 cm',
				weight: 300,
				price: 1800,
				category: 'architecture',
				subcategory: 'temple',
				material: 'Wood PLA',
				status: 'made-to-order',
				rating: 4.6,
				reviewCount: 18,
				isFeatured: true,
				createdAt: new Date('2024-02-05'),
			},
			{
				id: 'chorten-set-001',
				title: 'Traditional Chorten Set',
				shortDescription:
					'Beautiful set of miniature chortens perfect for meditation spaces and home altars.',
				detailedDescription:
					'Exquisite collection of miniature chortens, each representing different aspects of Buddhist teaching. Perfect for creating a complete meditation altar.',
				image: 'products/chorten2.png',
				images: [
					'products/chorten2.png',
					'products/chorten2.1.png',
					'products/chorten22.png',
				],
				dimensions: '8×8×12 cm (each)',
				weight: 150,
				price: 1500,
				originalPrice: 1800,
				category: 'sets',
				subcategory: 'miniature',
				material: 'PLA+',
				status: 'in-stock',
				rating: 4.8,
				reviewCount: 22,
				isFeatured: true,
				isNewArrival: true,
				createdAt: new Date('2024-02-25'),
			},
			{
				id: 'mini-chorten-001',
				title: 'Mini Desktop Chorten',
				shortDescription:
					'Compact chorten ideal for office desks and personal meditation spaces.',
				detailedDescription:
					'Perfect compact chorten designed for modern living spaces. Ideal for office desks, study rooms, or small meditation corners.',
				image: 'products/mini.png',
				images: ['products/mini.png'],
				dimensions: '6×6×9 cm',
				weight: 100,
				price: 800,
				category: 'accessories',
				subcategory: 'desktop',
				material: 'Eco PLA',
				status: 'in-stock',
				rating: 4.5,
				reviewCount: 35,
				isFeatured: true,
				createdAt: new Date('2024-02-10'),
			},
			{
				id: 'size-comparison-001',
				title: 'Chorten Size Collection',
				shortDescription:
					'Complete size range collection showing various chorten dimensions.',
				detailedDescription:
					'Educational collection showing the beautiful variety of sizes available for traditional chortens. Perfect for understanding scale and proportions.',
				image: 'products/size.png',
				images: ['products/size.png'],
				dimensions: 'Various sizes',
				weight: 200,
				price: 1200,
				category: 'sets',
				subcategory: 'educational',
				material: 'PLA+',
				status: 'in-stock',
				rating: 4.4,
				reviewCount: 12,
				isFeatured: false,
				createdAt: new Date('2024-03-01'),
			},
			{
				id: 'all-products-001',
				title: 'Complete Product Collection',
				shortDescription:
					'Comprehensive collection of all our featured chorten designs.',
				detailedDescription:
					'Our complete collection showcasing the full range of traditional Bhutanese chorten designs. Perfect for collectors and serious practitioners.',
				image: 'products/all products.png',
				images: ['products/all products.png'],
				dimensions: 'Collection set',
				weight: 2500,
				price: 8500,
				originalPrice: 10000,
				category: 'sets',
				subcategory: 'complete',
				material: 'Premium PLA+',
				status: 'made-to-order',
				rating: 5.0,
				reviewCount: 8,
				isFeatured: false,
				isBestSelling: true,
				createdAt: new Date('2024-01-20'),
			},
			{
				id: 'split-design-001',
				title: 'Architectural Study Model',
				shortDescription:
					'Split-section model showing internal structure and design elements.',
				detailedDescription:
					'Educational split-section model perfect for understanding the internal architecture and construction principles of traditional chortens.',
				image: 'products/splot.png',
				images: ['products/splot.png'],
				dimensions: '16×16×20 cm',
				weight: 450,
				price: 2000,
				category: 'educational',
				subcategory: 'study',
				material: 'PETG',
				status: 'made-to-order',
				rating: 4.7,
				reviewCount: 15,
				isFeatured: false,
				createdAt: new Date('2024-02-15'),
			},
			{
				id: 'custom-design-001',
				title: 'Custom Chorten Design',
				shortDescription:
					'Personalized chorten design service for unique spiritual needs.',
				detailedDescription:
					'Our custom design service allows you to create a unique chorten based on your specific spiritual requirements and traditional iconography.',
				image: 'products/dd.png',
				images: ['products/dd.png', 'products/dds.png'],
				dimensions: 'Custom dimensions',
				weight: 400,
				price: 3000,
				category: 'custom',
				subcategory: 'design',
				material: 'Various options',
				status: 'made-to-order',
				rating: 4.9,
				reviewCount: 25,
				isFeatured: false,
				createdAt: new Date('2024-02-08'),
			},
			{
				id: 'specialty-design-001',
				title: 'Designer Chorten Series',
				shortDescription:
					'Modern interpretation of traditional designs with contemporary aesthetics.',
				detailedDescription:
					'Our designer series combines traditional spiritual elements with contemporary design principles, perfect for modern meditation spaces.',
				image: 'products/ds.png',
				images: ['products/ds.png'],
				dimensions: '14×14×19 cm',
				weight: 380,
				price: 2400,
				category: 'decorative',
				subcategory: 'modern',
				material: 'Premium PETG',
				status: 'in-stock',
				rating: 4.6,
				reviewCount: 20,
				isFeatured: false,
				createdAt: new Date('2024-03-05'),
			},
			{
				id: 'special-edition-001',
				title: 'Limited Edition Chorten',
				shortDescription:
					'Special limited edition design with unique artistic elements.',
				detailedDescription:
					'Exclusive limited edition chorten featuring unique artistic elements and special finishing. Only available for a limited time.',
				image: 'products/ss.png',
				images: ['products/ss.png', 'products/sds.png'],
				dimensions: '16×16×22 cm',
				weight: 520,
				price: 3200,
				originalPrice: 3600,
				category: 'special',
				subcategory: 'limited',
				material: 'Premium PLA+',
				status: 'in-stock',
				rating: 4.8,
				reviewCount: 14,
				isFeatured: false,
				isBestSelling: true,
				createdAt: new Date('2024-01-25'),
			},
		];
	}

	/**
				isFeatured: false,
				isNewArrival: true,
				createdAt: new Date('2024-03-05'),
			},
		];
	}

	/**
	 * Apply all active filters
	 */
	applyFilters() {
		this.filteredProducts = this.allProducts.filter((product) => {
			// Search filter
			if (this.searchTerm) {
				const searchLower = this.searchTerm.toLowerCase();
				const matchesSearch =
					product.title.toLowerCase().includes(searchLower) ||
					product.shortDescription.toLowerCase().includes(searchLower) ||
					product.category.toLowerCase().includes(searchLower) ||
					product.material.toLowerCase().includes(searchLower);

				if (!matchesSearch) return false;
			}

			// Category filter
			if (this.selectedCategory && product.category !== this.selectedCategory) {
				return false;
			}

			// Material filter
			if (
				this.selectedMaterials.length > 0 &&
				!this.selectedMaterials.includes(product.material)
			) {
				return false;
			}

			// Price range filter
			if (this.priceRange.min !== null && product.price < this.priceRange.min) {
				return false;
			}
			if (this.priceRange.max !== null && product.price > this.priceRange.max) {
				return false;
			}

			// Availability filter
			if (
				this.selectedAvailability &&
				product.status !== this.selectedAvailability
			) {
				return false;
			}

			return true;
		});

		this.applySorting();
		this.currentPage = 1;
		this.updatePagination();
	}

	/**
	 * Apply sorting to filtered products
	 */
	applySorting() {
		this.filteredProducts.sort((a, b) => {
			switch (this.sortBy) {
				case 'featured':
					return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);

				case 'newest':
					return b.createdAt.getTime() - a.createdAt.getTime();

				case 'best-selling':
					return (
						(b.isBestSelling ? 1 : 0) - (a.isBestSelling ? 1 : 0) ||
						(b.reviewCount || 0) - (a.reviewCount || 0)
					);

				case 'price-low':
					return a.price - b.price;

				case 'price-high':
					return b.price - a.price;

				case 'rating':
					return (b.rating || 0) - (a.rating || 0);

				case 'name':
					return a.title.localeCompare(b.title);

				default:
					return 0;
			}
		});

		this.updatePagination();
	}

	/**
	 * Update pagination based on current page and filtered products
	 */
	updatePagination() {
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;
		this.paginatedProducts = this.filteredProducts.slice(start, end);
	}

	/**
	 * Toggle material filter
	 */
	toggleMaterial(material: string) {
		const index = this.selectedMaterials.indexOf(material);
		if (index > -1) {
			this.selectedMaterials.splice(index, 1);
		} else {
			this.selectedMaterials.push(material);
		}
		this.applyFilters();
	}

	/**
	 * Set availability filter
	 */
	setAvailability(availability: string) {
		this.selectedAvailability = availability;
		this.applyFilters();
	}

	/**
	 * Clear all filters
	 */
	clearFilters() {
		this.searchTerm = '';
		this.selectedCategory = '';
		this.selectedMaterials = [];
		this.selectedAvailability = '';
		this.priceRange = { min: null, max: null };
		this.sortBy = 'featured';
		this.applyFilters();
	}

	/**
	 * Set view mode
	 */
	setViewMode(mode: 'grid' | 'list') {
		this.viewMode = mode;
	}

	/**
	 * Handle page change
	 */
	onPageChange(event: any) {
		this.currentPage = Math.floor(event.first / event.rows) + 1;
		this.updatePagination();

		// Scroll to top of products section
		document
			.querySelector('.min-h-screen')
			?.scrollIntoView({ behavior: 'smooth' });
	}

	/**
	 * Get available products count
	 */
	get availableCount(): number {
		return this.allProducts.filter((p) => p.status === 'in-stock').length;
	}

	/**
	 * Handle image loading errors
	 */
	onImageError(event: any) {
		event.target.src = '/assets/images/product-placeholder.jpg';
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
	 * Add product to cart
	 */
	addToCart(product: Product) {
		// TODO: Implement cart service
		console.log('Adding to cart:', product);
		alert(`${product.title} added to cart!`);
	}
}
