export interface HeroSlide {
	id: number;
	title: string;
	description?: string;
	ctaText?: string;
	ctaLink?: string;
	imageUri: string;
	isActive: boolean;
	order: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateHeroSlideDto {
	title: string;
	description?: string;
	ctaText?: string;
	ctaLink?: string;
	imageUri?: string; // Optional - will be set from file upload
	isActive?: boolean;
	order?: number;
}

export interface UpdateHeroSlideDto {
	title?: string;
	description?: string;
	ctaText?: string;
	ctaLink?: string;
	imageUri?: string; // Optional - will be set from file upload if new image is uploaded
	isActive?: boolean;
	order?: number;
}

export interface ReorderSlidesDto {
	slideIds: number[];
}

