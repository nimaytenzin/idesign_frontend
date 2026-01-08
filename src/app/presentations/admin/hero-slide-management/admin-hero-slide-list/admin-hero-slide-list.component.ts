import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HeroSlideService } from '../../../../core/dataservice/hero-slide/hero-slide.service';
import { HeroSlide } from '../../../../core/dataservice/hero-slide/hero-slide.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { environment } from '../../../../../environments/environment';
import { AdminHeroSlideFormComponent } from '../admin-hero-slide-form/admin-hero-slide-form.component';

@Component({
	selector: 'app-admin-hero-slide-list',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-hero-slide-list.component.html',
	styleUrls: ['./admin-hero-slide-list.component.scss'],
})
export class AdminHeroSlideListComponent implements OnInit {
	slides: HeroSlide[] = [];
	loading = false;
	dialogRef?: DynamicDialogRef;

	constructor(
		private heroSlideService: HeroSlideService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadSlides();
	}

	loadSlides(): void {
		this.loading = true;
		this.heroSlideService.findAll(true).subscribe({
			next: (slides: HeroSlide[]) => {
				this.slides = slides.sort((a, b) => a.order - b.order);
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load hero slides',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openCreateDialog(): void {
		this.dialogRef = this.dialogService.open(AdminHeroSlideFormComponent, {
			header: 'Create New Hero Slide',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadSlides();
			}
		});
	}

	openEditDialog(slide: HeroSlide): void {
		this.dialogRef = this.dialogService.open(AdminHeroSlideFormComponent, {
			header: 'Edit Hero Slide',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				slide: slide,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadSlides();
			}
		});
	}

	deleteSlide(slide: HeroSlide): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${slide.title}"? This action cannot be undone.`,
			header: 'Delete Hero Slide',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.heroSlideService.remove(slide.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Hero slide deleted successfully',
						});
						this.loadSlides();
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to delete hero slide',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
			},
		});
	}

	toggleActive(slide: HeroSlide): void {
		const formData = new FormData();
		formData.append('isActive', (!slide.isActive).toString());

		this.heroSlideService.update(slide.id, formData).subscribe({
			next: (updatedSlide) => {
				slide.isActive = updatedSlide.isActive;
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: `Slide ${updatedSlide.isActive ? 'activated' : 'deactivated'} successfully`,
				});
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to update slide status',
				});
				this.cdr.markForCheck();
			},
		});
	}

	reorderSlides(): void {
		const slideIds = this.slides.map((slide) => slide.id);
		this.heroSlideService.reorder(slideIds).subscribe({
			next: (slides: HeroSlide[]) => {
				this.slides = slides;
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Slides reordered successfully',
				});
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to reorder slides',
				});
				this.cdr.markForCheck();
			},
		});
	}

	getImageUrl(imageUri: string): string {
		if (!imageUri) {
			return '/assets/images/no-image.png';
		}
		if (imageUri.startsWith('http')) {
			return imageUri;
		}
		return `${environment.BASEAPI_URL}${imageUri}`;
	}
}

