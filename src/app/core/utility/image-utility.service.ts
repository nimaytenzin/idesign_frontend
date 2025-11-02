import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ImageUtilityService {
	/**
	 * Constructs the full image URL by combining base API URL with image path
	 * @param imagePath - The relative image path from the server
	 * @returns The complete image URL
	 */
	getImageUrl(imagePath: string): string {
		if (!imagePath) {
			return '/assets/images/no-image.png';
		}

		// Remove leading slash if present to avoid double slashes
		const cleanPath = imagePath.startsWith('/')
			? imagePath.substring(1)
			: imagePath;

		return `${environment.BASEAPI_URL}/${cleanPath}`;
	}

	/**
	 * Gets the primary image URL from a product's images array
	 * @param images - Array of product images
	 * @returns The primary image URL or default no-image placeholder
	 */
	getPrimaryImageUrl(
		images?: { imagePath: string; isPrimary: boolean }[]
	): string {
		if (!images || images.length === 0) {
			return '/assets/images/no-image.png';
		}

		const primaryImage = images.find((img) => img.isPrimary);

		if (primaryImage) {
			return this.getImageUrl(primaryImage.imagePath);
		}

		// If no primary image is found, use the first image
		return this.getImageUrl(images[0].imagePath);
	}

	/**
	 * Gets all image URLs from a product's images array
	 * @param images - Array of product images
	 * @returns Array of complete image URLs
	 */
	getAllImageUrls(images?: { imagePath: string }[]): string[] {
		if (!images || images.length === 0) {
			return ['/assets/images/no-image.png'];
		}

		return images.map((img) => this.getImageUrl(img.imagePath));
	}

	/**
	 * Checks if an image URL is valid (not the default no-image placeholder)
	 * @param imageUrl - The image URL to check
	 * @returns True if the image URL is valid, false otherwise
	 */
	isValidImageUrl(imageUrl: string): boolean {
		return imageUrl !== '/assets/images/no-image.png' && imageUrl.trim() !== '';
	}

	/**
	 * Gets an optimized image URL with size parameters (if supported by backend)
	 * @param imagePath - The relative image path from the server
	 * @param width - Desired width in pixels
	 * @param height - Desired height in pixels
	 * @returns The complete image URL with size parameters
	 */
	getOptimizedImageUrl(
		imagePath: string,
		width?: number,
		height?: number
	): string {
		const baseUrl = this.getImageUrl(imagePath);

		if (baseUrl === '/assets/images/no-image.png') {
			return baseUrl;
		}

		const params = new URLSearchParams();
		if (width) params.append('w', width.toString());
		if (height) params.append('h', height.toString());

		const queryString = params.toString();
		return queryString ? `${baseUrl}?${queryString}` : baseUrl;
	}
}
