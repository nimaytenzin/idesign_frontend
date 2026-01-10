import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../../core/dataservice/product-sub-category/product-sub-category.service';
import { Product, ProductImage } from '../../../../../core/dataservice/product/product.interface';
import { ProductCategory, ProductSubCategory } from '../../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-view-product',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './view-product.component.html',
})
export class ViewProductComponent implements OnInit {
	productId: number | null = null;
	loading: boolean = false;
	product: Product | null = null;

	// Categories
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];

	// Images
	selectedImageIndex: number = 0;

	constructor(
		private productService: ProductService,
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		this.loadCategories();

		// Get product ID from config
		if (this.config?.data?.product) {
			this.product = this.config.data.product;
			this.productId = this.product?.id || null;
		} else if (this.config?.data?.productId) {
			this.productId = this.config.data.productId;
			this.loadProduct();
		}
	}

	loadCategories() {
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				this.loadSubCategories();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load categories',
				});
			},
		});
	}

	loadSubCategories() {
		this.subCategoryService.getSubCategories().subscribe({
			next: (data) => {
				this.subCategories = data;
				this.cdr.markForCheck();
			},
		});
	}

	loadProduct() {
		if (!this.productId) return;
		this.loading = true;
		this.productService.getProductById(this.productId).subscribe({
			next: (data) => {
				this.product = data;
				// Set primary image as selected
				const primaryIndex = data.images?.findIndex(img => img.isPrimary) ?? 0;
				this.selectedImageIndex = primaryIndex >= 0 ? primaryIndex : 0;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load product',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close();
				}
				this.cdr.markForCheck();
			},
		});
	}

	selectImage(index: number) {
		this.selectedImageIndex = index;
	}

	previousImage() {
		if (this.selectedImageIndex > 0) {
			this.selectedImageIndex--;
		}
	}

	nextImage() {
		const images = this.getAllImages();
		if (this.selectedImageIndex < images.length - 1) {
			this.selectedImageIndex++;
		}
	}

	getImageUrl(imagePath: string): string {
		if (!imagePath) {
			return '/assets/images/no-image.png';
		}
		if (imagePath.startsWith('http')) {
			return imagePath;
		}
		const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
		return `${environment.BASEAPI_URL}/${cleanPath}`;
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}

	getCategoryName(categoryId: number): string {
		const category = this.categories.find((c) => c.id === categoryId);
		return category?.name || '';
	}

	getSubCategoryName(subCategoryId: number): string {
		const subCategory = this.subCategories.find((s) => s.id === subCategoryId);
		return subCategory?.name || 'N/A';
	}

	getPrimaryImage(): string {
		if (!this.product?.images || this.product.images.length === 0) {
			return '/assets/images/no-image.png';
		}
		const primaryImage = this.product.images.find(img => img.isPrimary);
		const imagePath = primaryImage?.imagePath || this.product.images[0]?.imagePath;
		return this.getImageUrl(imagePath);
	}

	getAllImages(): ProductImage[] {
		return this.product?.images || [];
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}

