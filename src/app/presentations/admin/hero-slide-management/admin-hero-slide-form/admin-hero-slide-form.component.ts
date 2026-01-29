import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { HeroSlideService } from '../../../../core/dataservice/hero-slide/hero-slide.service';
import { HeroSlide } from '../../../../core/dataservice/hero-slide/hero-slide.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-admin-hero-slide-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-hero-slide-form.component.html',
	styleUrls: ['./admin-hero-slide-form.component.scss'],
})
export class AdminHeroSlideFormComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	isEditMode: boolean = false;
	slideId?: number;

	// Form Data
	title: string = '';
	description: string = '';
	ctaText: string = '';
	ctaLink: string = '';
	isActive: boolean = true;
	order: number = 0;

	// File Upload
	selectedFile: File | null = null;
	uploadedFiles: File[] = [];
	previewUrl: string | null = null;
	existingImageUrl: string | null = null;

	MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

	constructor(
		private heroSlideService: HeroSlideService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit(): void {
		if (this.config.data?.slide) {
			this.isEditMode = true;
			this.slideId = this.config.data.slide.id;
			this.loadSlide(this.config.data.slide);
		}
	}

	loadSlide(slide: HeroSlide): void {
		this.title = slide.title;
		this.description = slide.description || '';
		this.ctaText = slide.ctaText || '';
		this.ctaLink = slide.ctaLink || '';
		this.isActive = slide.isActive;
		this.order = slide.order;
		this.existingImageUrl = slide.imageUri;
		this.previewUrl = this.getImageUrl(slide.imageUri);
		this.cdr.markForCheck();
	}

	onFileSelect(event: any): void {
		const files = event.files;
		if (files && files.length > 0) {
			const file = files[0];

			// Validate file type
			if (!this.ALLOWED_TYPES.includes(file.type)) {
				this.messageService.add({
					severity: 'error',
					summary: 'Invalid File Type',
					detail: 'Only image files (JPEG, PNG, GIF, WebP) are allowed!',
				});
				event.clear(); // Clear the file upload
				this.selectedFile = null;
				this.uploadedFiles = [];
				this.previewUrl = this.existingImageUrl ? this.getImageUrl(this.existingImageUrl) : null;
				this.cdr.markForCheck();
				return;
			}

			// Validate file size
			if (file.size > this.MAX_FILE_SIZE) {
				this.messageService.add({
					severity: 'error',
					summary: 'File Too Large',
					detail: 'File size must be less than 10MB!',
				});
				event.clear(); // Clear the file upload
				this.selectedFile = null;
				this.uploadedFiles = [];
				this.previewUrl = this.existingImageUrl ? this.getImageUrl(this.existingImageUrl) : null;
				this.cdr.markForCheck();
				return;
			}

			// Store the file - only if validation passes
			this.selectedFile = file;
			this.uploadedFiles = [file];

			// Create preview
			const reader = new FileReader();
			reader.onload = (e: any) => {
				this.previewUrl = e.target.result;
				this.cdr.markForCheck();
			};
			reader.onerror = () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to read image file',
				});
				this.selectedFile = null;
				this.uploadedFiles = [];
				this.cdr.markForCheck();
			};
			reader.readAsDataURL(file);
			this.cdr.markForCheck();
		}
	}

	onFileRemove(event: any): void {
		this.selectedFile = null;
		this.uploadedFiles = [];
		this.previewUrl = this.existingImageUrl ? this.getImageUrl(this.existingImageUrl) : null;
		this.cdr.markForCheck();
	}

	removeImage(): void {
		this.selectedFile = null;
		this.uploadedFiles = [];
		this.previewUrl = this.existingImageUrl ? this.getImageUrl(this.existingImageUrl) : null;
		this.cdr.markForCheck();
	}

	onSubmit(): void {
		this.submitted = true;

		if (!this.title.trim()) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Title is required',
			});
			return;
		}

		// Validate and normalize order - ensure it's a non-negative integer
		const orderValue = Math.max(0, Math.floor(Number(this.order) || 0));
		if (isNaN(orderValue) || orderValue < 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Order must be a number greater than or equal to 0',
			});
			return;
		}

		// For new slides, image is required
		if (!this.isEditMode) {
			// Check if file is selected (either in selectedFile or uploadedFiles)
			const hasFile = this.selectedFile || (this.uploadedFiles && this.uploadedFiles.length > 0);
			
			if (!hasFile) {
				this.messageService.add({
					severity: 'warn',
					summary: 'Validation Error',
					detail: 'Image is required for new slides',
				});
				return;
			}

			// Ensure selectedFile is set from uploadedFiles if needed
			if (!this.selectedFile && this.uploadedFiles && this.uploadedFiles.length > 0) {
				this.selectedFile = this.uploadedFiles[0];
			}
		}

		this.loading = true;

		const formData = new FormData();
		formData.append('title', this.title);
		if (this.description) {
			formData.append('description', this.description);
		}
		if (this.ctaText) {
			formData.append('ctaText', this.ctaText);
		}
		if (this.ctaLink) {
			formData.append('ctaLink', this.ctaLink);
		}
		// Ensure boolean is sent correctly - use "true"/"false" strings (backend should parse these)
		formData.append('isActive', this.isActive ? 'true' : 'false');
		// Ensure order is a valid integer number string
		formData.append('order', String(orderValue));

		// Append image file if selected
		if (this.selectedFile) {
			formData.append('image', this.selectedFile);
		}

		if (this.isEditMode && this.slideId) {
			this.updateSlide(this.slideId, formData);
		} else {
			this.createSlide(formData);
		}
	}

	createSlide(formData: FormData): void {
		this.heroSlideService.create(formData).subscribe({
			next: (slide) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Hero slide created successfully',
				});
				this.ref.close(slide);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to create hero slide',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	updateSlide(id: number, formData: FormData): void {
		this.heroSlideService.update(id, formData).subscribe({
			next: (slide) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Hero slide updated successfully',
				});
				this.ref.close(slide);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to update hero slide',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	cancel(): void {
		this.ref.close();
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

