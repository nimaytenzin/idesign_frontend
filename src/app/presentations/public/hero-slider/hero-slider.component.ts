import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSlideService } from '../../../core/dataservice/hero-slide/hero-slide.service';
import { HeroSlide } from '../../../core/dataservice/hero-slide/hero-slide.interface';
import { environment } from '../../../../environments/environment';

@Component({
	selector: 'app-hero-slider',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './hero-slider.component.html',
	styleUrls: ['./hero-slider.component.scss'],
})
export class HeroSliderComponent implements OnInit, OnDestroy {
	slides: HeroSlide[] = [];
	currentSlideIndex = 0;
	loading = false;
	private autoSlideInterval?: any;

	constructor(
		private heroSlideService: HeroSlideService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadSlides();
	}

	ngOnDestroy(): void {
		if (this.autoSlideInterval) {
			clearInterval(this.autoSlideInterval);
		}
	}

	loadSlides(): void {
		this.loading = true;
		this.heroSlideService.getActiveSlides().subscribe({
			next: (slides: HeroSlide[]) => {
				this.slides = slides.sort((a, b) => a.order - b.order);
				this.loading = false;
				if (this.slides.length > 0) {
					this.startAutoSlide();
				}
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Error loading hero slides:', error);
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	startAutoSlide(): void {
		if (this.slides.length <= 1) return;

		this.autoSlideInterval = setInterval(() => {
			this.nextSlide();
		}, 5000); // Change slide every 5 seconds
	}

	nextSlide(): void {
		if (this.slides.length > 0) {
			this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
			this.cdr.markForCheck();
		}
	}

	previousSlide(): void {
		if (this.slides.length > 0) {
			this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
			this.cdr.markForCheck();
		}
	}

	goToSlide(index: number): void {
		this.currentSlideIndex = index;
		this.cdr.markForCheck();
	}

	getImageUrl(imageUri: string): string {
		if (!imageUri) {
			return '/product-placeholder.png';
		}
		if (imageUri.startsWith('http')) {
			return imageUri;
		}
		return `${environment.BASEAPI_URL}${imageUri}`;
	}
}

