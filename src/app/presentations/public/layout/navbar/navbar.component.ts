import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { APPNAME } from '../../../../core/constants/constants';
import { CartService } from '../../../../core/services/cart.service';
import { CompanyService } from '../../../../core/dataservice/company/company.service';
import { Company } from '../../../../core/dataservice/company/company.interface';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
	standalone: true,
	imports: [CommonModule, ButtonModule],
})
export class NavbarComponent implements OnInit, OnDestroy {
	APPNAME = APPNAME;
	isMenuOpen = false;
	scrolled = false;
	scrollPosition = 0;
	cartItemCount = 0;
	cartIconAnimated = false;
	company: Company | null = null;
	private cartSubscription?: Subscription;
	private cartAnimationSubscription?: Subscription;

	navItems = [
		{
			label: 'Home',
			route: '/',
			icon: 'pi-home',
		},
		{
			label: 'Products',
			route: '/products',
			icon: 'pi-box',
		},
		{
			label: 'Custom Orders',
			route: '/custom',
			icon: 'pi-cog',
		},
		{
			label: 'Gallery',
			route: '/gallery',
			icon: 'pi-images',
		},
		{
			label: 'About',
			route: '/about',
			icon: 'pi-info-circle',
		},
	];

	constructor(
		private router: Router,
		private cartService: CartService,
		private companyService: CompanyService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		// Initialize scroll detection
		this.detectScroll();
		
		// Subscribe to cart updates
		this.cartSubscription = this.cartService.cartItems$.subscribe(() => {
			this.cartItemCount = this.cartService.getTotalItems();
			this.cdr.markForCheck();
		});
		
		// Subscribe to cart animation trigger
		this.cartAnimationSubscription = this.cartService.cartAnimation$.subscribe(() => {
			this.animateCartIcon();
		});
		
		// Get initial cart count
		this.cartItemCount = this.cartService.getTotalItems();
		
		// Load company data
		this.loadCompany();
	}

	loadCompany() {
		this.companyService.getCompany().subscribe({
			next: (data) => {
				this.company = data;
				this.cdr.markForCheck();
			},
			error: () => {
				// If company doesn't exist, use default
				this.company = null;
				this.cdr.markForCheck();
			},
		});
	}

	getLogoUrl(): string {
		if (this.company && this.company.logo) {
			// Use the logo endpoint
			return this.companyService.getLogoUrl();
		}
		// Fallback to default logo
		return 'logo.png';
	}

	ngOnDestroy() {
		// Cleanup subscriptions
		if (this.cartSubscription) {
			this.cartSubscription.unsubscribe();
		}
		if (this.cartAnimationSubscription) {
			this.cartAnimationSubscription.unsubscribe();
		}
	}

	@HostListener('window:scroll')
	onWindowScroll() {
		this.detectScroll();
	}

	/**
	 * Detect scroll position and update navbar appearance
	 */
	private detectScroll(): void {
		this.scrollPosition =
			window.pageYOffset ||
			document.documentElement.scrollTop ||
			document.body.scrollTop ||
			0;
		this.scrolled = this.scrollPosition > 50;
	}

	/**
	 * Toggle mobile menu with enhanced animations
	 */
	toggleMenu(): void {
		this.isMenuOpen = !this.isMenuOpen;

		// Prevent body scroll when menu is open
		if (this.isMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}

	/**
	 * Close mobile menu with cleanup
	 */
	closeMenu(): void {
		this.isMenuOpen = false;
		document.body.style.overflow = '';
	}

	/**
	 * Enhanced navigation with smooth scroll for home
	 */
	navigateTo(route: string): void {
		if (route === '/' && this.router.url === '/') {
			// If already on home page, scroll to top smoothly
			this.scrollToTop();
		} else {
			this.router.navigate([route]);
		}
		this.closeMenu();
	}

	/**
	 * Navigate to login page
	 */
	goToLoginPage(): void {
		this.router.navigate(['auth/login']);
		this.closeMenu();
	}

	/**
	 * Check if route is currently active
	 */
	isActiveRoute(route: string): boolean {
		if (route === '/') {
			return this.router.url === '/';
		}
		return this.router.url.startsWith(route);
	}

	/**
	 * Smooth scroll to top functionality
	 */
	private scrollToTop(): void {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}

	/**
	 * Handle search functionality (placeholder for future implementation)
	 */
	onSearch(): void {
		// TODO: Implement search functionality
		console.log('Search functionality to be implemented');
	}

	/**
	 * Navigate to checkout page
	 */
	goToCheckout(): void {
		if (this.cartItemCount > 0) {
			this.router.navigate(['/checkout']);
		}
		this.closeMenu();
	}

	/**
	 * Get scroll progress percentage (for potential progress indicator)
	 */
	getScrollProgress(): number {
		const winScroll =
			document.body.scrollTop || document.documentElement.scrollTop;
		const height =
			document.documentElement.scrollHeight -
			document.documentElement.clientHeight;
		return (winScroll / height) * 100;
	}

	/**
	 * Animate cart icon when item is added
	 */
	animateCartIcon(): void {
		this.cartIconAnimated = true;
		this.cdr.markForCheck();
		
		// Reset animation after animation completes
		setTimeout(() => {
			this.cartIconAnimated = false;
			this.cdr.markForCheck();
		}, 500); // Match animation duration
	}
}
