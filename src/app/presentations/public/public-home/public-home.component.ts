import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductCarouselComponent } from '../../../shared/components/product-carousel/product-carousel.component';

@Component({
	selector: 'app-public-home',
	standalone: true,
	imports: [ProductCarouselComponent],
	templateUrl: './public-home.component.html',
	styleUrls: ['./public-home.component.scss'],
})
export class PublicHomeComponent {
	constructor(private router: Router) {}

	exploreProducts(): void {
		this.router.navigate(['/products']);
	}

	getCustomQuote(): void {
		this.router.navigate(['/custom-orders']);
	}

	onImageError(event: any, fallbackSrc: string): void {
		event.target.src = fallbackSrc;
	}
}
