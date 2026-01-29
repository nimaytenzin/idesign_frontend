import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../../core/dataservice/product-sub-category/product-sub-category.service';
import { CreateProductDto } from '../../../../../core/dataservice/product/product.interface';
import { ProductCategory, ProductSubCategory } from '../../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-create-product',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-product.component.html',
	styleUrls: ['./create-product.component.scss'],
})
export class CreateProductComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	activeStep: number = 0;
	createdProductId: number | null = null;

	steps = [
		{ label: 'Product Information' },
		{ label: 'Product Images' },
	];

	// Form Data
	product: Partial<CreateProductDto> = {
		title: '',
		shortDescription: '',
		detailedDescription: '',
		dimensions: '',
		weight: 0,
		price: 0,
		material: undefined,
		isAvailable: true,
		isFeatured: false,
		productSubCategoryId: 0,
	};

	// Categories
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];
	filteredSubCategories: ProductSubCategory[] = [];
	selectedCategoryId: number | null = null;

	// Images
	uploadedFiles: File[] = [];
	imagePreviewUrls: string[] = [];

	// Material Options
	materialOptions = [
		{ label: 'PLA', value: 'PLA' },
		{ label: 'ABS', value: 'ABS' },
		{ label: 'PETG', value: 'PETG' },
		{ label: 'TPU', value: 'TPU' },
		{ label: 'Wood', value: 'Wood' },
		{ label: 'Metal', value: 'Metal' },
		{ label: 'Resin', value: 'Resin' },
	];

	constructor(
		private productService: ProductService,
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() private router?: Router,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		this.loadCategories();
		
		// Handle duplicate product scenario
		if (this.config?.data?.duplicateProductId) {
			this.loadProductForDuplicate(this.config.data.duplicateProductId);
		}
	}

	loadCategories() {
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data.filter((cat) => cat.isActive);
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
				this.subCategories = data.filter((sub) => sub.isActive);
				this.filteredSubCategories = [];
				this.cdr.markForCheck();
			},
		});
	}

	onParentCategoryChange() {
		if (this.selectedCategoryId) {
			this.filteredSubCategories = this.subCategories.filter(
				(sub) => sub.productCategoryId === this.selectedCategoryId
			);
			// Clear subcategory selection when parent changes
			this.product.productSubCategoryId = 0;
		} else {
			this.filteredSubCategories = [];
			this.product.productSubCategoryId = 0;
		}
		this.cdr.markForCheck();
	}

	loadProductForDuplicate(productId: number) {
		this.loading = true;
		this.productService.getProductById(productId).subscribe({
			next: (data) => {
				// Load product data but clear ID and title to indicate it's a duplicate
				this.product = {
					title: `${data.title} (Copy)`,
					shortDescription: data.shortDescription,
					detailedDescription: data.detailedDescription,
					dimensions: data.dimensions,
					weight: data.weight,
					price: data.price,
					material: data.material ?? undefined,
					isAvailable: data.isAvailable,
					isFeatured: false, // Don't duplicate featured status
					productSubCategoryId: data.productSubCategoryId,
				} as Partial<CreateProductDto>;
				
				// Set parent category based on subcategory
				const selectedSub = this.subCategories.find((s) => s.id === data.productSubCategoryId);
				if (selectedSub) {
					this.selectedCategoryId = selectedSub.productCategoryId;
					this.filteredSubCategories = this.subCategories.filter(
						(s) => s.productCategoryId === selectedSub.productCategoryId
					);
				}
				
				// Reset to step 1 for duplicate products
				this.activeStep = 0;
				this.createdProductId = null;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load product for duplication',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onFileSelect(event: any) {
		const files = Array.from(event.files) as File[];
		this.uploadedFiles = [...this.uploadedFiles, ...files];
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e: any) => {
				this.imagePreviewUrls.push(e.target.result);
				this.cdr.markForCheck();
			};
			reader.readAsDataURL(file);
		});
	}

	removeImage(index: number) {
		this.imagePreviewUrls.splice(index, 1);
		this.uploadedFiles.splice(index, 1);
	}

	nextStep() {
		if (this.activeStep === 0) {
			// Validate and save product info, then move to step 2
			this.submitted = true;
			if (!this.isFormValid()) {
				return;
			}

			this.loading = true;
			const createData: CreateProductDto = this.product as CreateProductDto;
			this.productService.createProduct(createData).subscribe({
				next: (createdProduct) => {
					this.createdProductId = createdProduct.id;
					this.activeStep = 1;
					this.loading = false;
					this.submitted = false; // Reset for step 2
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Product information saved. Now add images.',
					});
					this.cdr.markForCheck();
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to create product',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	prevStep() {
		if (this.activeStep > 0) {
			this.activeStep--;
			this.cdr.markForCheck();
		}
	}

	skipImages() {
		// Skip image upload and finish
		if (this.createdProductId) {
			this.productService.getProductById(this.createdProductId).subscribe({
				next: (fullProduct) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Product created successfully',
					});
					if (this.ref) {
						this.ref.close(fullProduct);
					} else if (this.router) {
						this.router.navigate(['/admin/products']);
					}
				},
				error: () => {
					if (this.ref) {
						this.ref.close();
					} else if (this.router) {
						this.router.navigate(['/admin/products']);
					}
				},
			});
		}
	}

	finish() {
		// Upload images and finish
		if (!this.createdProductId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Product ID not found. Please go back and try again.',
			});
			return;
		}

		if (this.uploadedFiles.length === 0) {
			this.skipImages();
			return;
		}

		this.loading = true;
		this.uploadImages(this.createdProductId, true);
	}

	saveProduct() {
		// Legacy method - redirects to nextStep for step 1
		if (this.activeStep === 0) {
			this.nextStep();
		} else {
			this.finish();
		}
	}

	uploadImages(productId: number, isNewProduct: boolean) {
		// For new products, always set first image as primary
		const isPrimaryArray = this.uploadedFiles.map((_, index) => index === 0);

		this.productService.uploadProductImages(productId, this.uploadedFiles, {
			isPrimary: isPrimaryArray,
		}).subscribe({
			next: (uploadedImages) => {
				// Clear uploaded files and previews
				this.uploadedFiles = [];
				this.imagePreviewUrls = [];
				
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Product created and images uploaded successfully',
				});
				
				if (this.ref) {
					// Get the full product with images to return to parent
					this.productService.getProductById(productId).subscribe({
						next: (fullProduct) => {
							this.loading = false;
							this.ref?.close(fullProduct);
						},
						error: () => {
							this.loading = false;
							this.ref?.close();
						},
					});
				} else if (this.router) {
					this.loading = false;
					this.router.navigate(['/admin/products']);
				} else {
					this.loading = false;
					this.cdr.markForCheck();
				}
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Product saved but failed to upload images. Please try uploading images again.',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	isStep1Valid(): boolean {
		return !!(
			this.product.title &&
			this.product.shortDescription &&
			this.product.price &&
			this.product.productSubCategoryId &&
			this.selectedCategoryId
		);
	}

	isFormValid(): boolean {
		return this.isStep1Valid();
	}

	cancel() {
		if (this.ref) {
			this.ref.close();
		} else if (this.router) {
			this.router.navigate(['/admin/products']);
		}
	}

	getImageUrl(imagePath: string): string {
		if (!imagePath) {
			return '/product-placeholder.png';
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
}

