import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

// Product interface
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
	selector: 'app-product-carousel',
	templateUrl: './product-carousel.component.html',
	styleUrls: ['./product-carousel.component.scss'],
	standalone: true,
	imports: [CommonModule, CarouselModule],
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

	constructor(private router: Router) {}

	ngOnInit() {
		this.loadFeaturedProducts();
	}

	/**
	 * Load featured products - in real app, this would come from a service
	 */
	loadFeaturedProducts() {
		// Featured products using actual images from products folder
		this.featuredProducts = [
			{
				id: 'memorial-chorten-001',
				title: 'Memorial Chorten',
				shortDescription:
					'Traditional memorial stupa with authentic Bhutanese architecture and spiritual significance.',
				image: 'products/memorial-chorten.png',
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
				image: 'products/dochula chorten.png',
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
				image: 'products/jangchub chorten.png',
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
				image: 'products/dechenphug lhakhang top.png',
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
				image: 'products/chorten2.png',
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
				image: 'products/mini.png',
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
		];
	}

	/**
	 * Handle image loading errors
	 */
	onImageError(event: any) {
		// Set a placeholder image when the original fails to load
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
	 * Navigate to all products page
	 */
	viewAllProducts() {
		this.router.navigate(['/products']);
	}

	/**
	 * Add product to cart
	 */
	addToCart(product: Product) {
		// TODO: Implement cart service
		console.log('Adding to cart:', product);

		// Show success message (you can use a toast service)
		// For now, just log the action
		alert(`${product.title} added to cart!`);
	}
}
