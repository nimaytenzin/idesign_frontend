import { Component, OnInit, ChangeDetectorRef, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../../core/dataservice/product-sub-category/product-sub-category.service';
import { Product, CreateProductDto, UpdateProductDto, ProductImage } from '../../../../../core/dataservice/product/product.interface';
import { ProductCategory, ProductSubCategory } from '../../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-update-product',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, ConfirmationService],
	templateUrl: './update-product.component.html',
	styleUrls: ['./update-product.component.scss'],
})
export class UpdateProductComponent implements OnInit {
	productId: number | null = null;
	loading: boolean = false;
	submitted: boolean = false;

	// Form Data
	product: Partial<CreateProductDto> = {
		title: '',
		shortDescription: '',
		detailedDescription: '',
		dimensions: '',
		weight: 0,
		price: 0,
		material: '',
		isAvailable: true,
		isFeatured: false,
		productSubCategoryId: 0,
		stockQuantity: 0,
	};

	// Categories
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];
	filteredSubCategories: ProductSubCategory[] = [];
	selectedCategoryId: number | null = null;

	// Images
	productImages: ProductImage[] = [];
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
		private confirmationService: ConfirmationService,
		private cdr: ChangeDetectorRef,
		@Optional() private route?: ActivatedRoute,
		@Optional() private router?: Router,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		this.loadCategories();

		// Check if in dialog mode or route mode
		if (this.ref && this.config) {
			// Dialog mode
			if (this.config.data?.product) {
				this.productId = this.config.data.product.id;
				this.loadProduct();
			} else if (this.config.data?.productId) {
				this.productId = this.config.data.productId;
				this.loadProduct();
			}
		} else if (this.route && this.router) {
			// Route mode
			this.route.params.subscribe((params) => {
				if (params['id']) {
					this.productId = +params['id'];
					this.loadProduct();
				}
			});
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
				if (this.productId) {
					this.updateFilteredSubCategories();
				} else {
					this.filteredSubCategories = [];
				}
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

	updateFilteredSubCategories() {
		if (this.product.productSubCategoryId) {
			const selectedSub = this.subCategories.find(
				(s) => s.id === this.product.productSubCategoryId
			);
			if (selectedSub) {
				this.selectedCategoryId = selectedSub.productCategoryId;
				this.filteredSubCategories = this.subCategories.filter(
					(s) => s.productCategoryId === selectedSub.productCategoryId
				);
			} else {
				this.filteredSubCategories = [];
			}
		} else {
			this.filteredSubCategories = [];
		}
		this.cdr.markForCheck();
	}

	loadProduct() {
		if (!this.productId) return;
		this.loading = true;
		this.productService.getProductById(this.productId).subscribe({
			next: (data) => {
				this.product = {
					title: data.title,
					shortDescription: data.shortDescription,
					detailedDescription: data.detailedDescription,
					dimensions: data.dimensions,
					weight: data.weight,
					price: data.price,
					material: data.material,
					isAvailable: data.isAvailable,
					isFeatured: data.isFeatured,
					productSubCategoryId: data.productSubCategoryId,
					stockQuantity: data.stockQuantity,
				} as Partial<CreateProductDto>;
				this.productImages = data.images || [];
				this.updateFilteredSubCategories();
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
				} else if (this.router) {
					this.router.navigate(['/admin/products']);
				}
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

	deleteExistingImage(imageId: number) {
		if (!this.productId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Product ID is missing',
			});
			return;
		}

		const image = this.productImages.find(img => img.id === imageId);
		const imageName = image?.fileName || 'this image';

		this.confirmationService.confirm({
			message: `Are you sure you want to delete ${imageName}? This action cannot be undone.`,
			header: 'Delete Image',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.productService.deleteProductImage(this.productId!, imageId).subscribe({
					next: () => {
						// Remove from local array
						this.productImages = this.productImages.filter(img => img.id !== imageId);
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Image deleted successfully',
						});
						this.cdr.markForCheck();
					},
					error: (error) => {
						console.error('Delete image error:', error);
						let errorMessage = 'Failed to delete image';
						
						if (error?.error?.message) {
							errorMessage = error.error.message;
						} else if (error?.status === 404) {
							errorMessage = 'Image not found';
						}
						
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: errorMessage,
						});
					},
				});
			},
		});
	}

	setAsPrimaryImage(imageId: number) {
		if (!this.productId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Product ID is missing',
			});
			return;
		}

		const image = this.productImages.find(img => img.id === imageId);
		if (!image) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Image not found',
			});
			return;
		}

		// If already primary, no need to do anything
		if (image.isPrimary) {
			return;
		}

		this.productService.setPrimaryImage(this.productId, imageId).subscribe({
			next: (updatedImage) => {
				// Update local array - set this image as primary and others as not primary
				this.productImages = this.productImages.map(img => ({
					...img,
					isPrimary: img.id === imageId
				}));
				
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Primary image updated successfully',
				});
				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Set primary image error:', error);
				let errorMessage = 'Failed to set primary image';
				
				if (error?.error?.message) {
					errorMessage = error.error.message;
				} else if (error?.status === 404) {
					errorMessage = 'Image not found';
				}
				
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: errorMessage,
				});
			},
		});
	}

	updateProductDetails() {
		this.submitted = true;

		if (!this.isFormValid()) {
			return;
		}

		if (!this.productId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Product ID is missing',
			});
			return;
		}

		this.loading = true;

		// Update existing product details only
		const updateData: UpdateProductDto = { ...this.product };
		this.productService.updateProduct(this.productId, updateData).subscribe({
			next: (updatedProduct) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Product details updated successfully',
				});
				this.loading = false;
				
				// Reload product to get latest data
				this.loadProduct();
				
				if (this.ref) {
					// Don't close dialog, let user continue editing
					this.cdr.markForCheck();
				} else if (this.router) {
					// In route mode, optionally navigate or stay
					this.cdr.markForCheck();
				} else {
					this.cdr.markForCheck();
				}
			},
			error: (error) => {
				console.error('Product update error:', error);
				let errorMessage = 'Failed to update product details';
				
				if (error?.error?.message) {
					errorMessage = error.error.message;
				} else if (error?.status === 404) {
					errorMessage = 'Product not found. Please refresh and try again.';
				}
				
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: errorMessage,
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	updateProductImages() {
		if (!this.productId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Product ID is missing',
			});
			return;
		}

		// Check if there are files to upload
		if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'No Images',
				detail: 'Please select images to upload',
			});
			return;
		}

		this.loading = true;
		this.uploadImages(this.productId, false);
	}

	uploadImages(productId: number, isNewProduct: boolean) {
		// Validate files before upload
		if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
			this.loading = false;
			this.cdr.markForCheck();
			return;
		}

		// Check file sizes (50MB limit)
		const maxSize = 50 * 1024 * 1024; // 50MB in bytes
		const oversizedFiles = this.uploadedFiles.filter(file => file.size > maxSize);
		if (oversizedFiles.length > 0) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: `Some files exceed the 50MB limit. Please reduce file size and try again.`,
			});
			this.loading = false;
			this.cdr.markForCheck();
			return;
		}

		// For existing products, only set as primary if no existing images
		const hasExistingImages = this.productImages.length > 0;
		const isPrimaryArray = !hasExistingImages 
			? this.uploadedFiles.map((_, index) => index === 0)
			: this.uploadedFiles.map(() => false);

		this.productService.uploadProductImages(productId, this.uploadedFiles, {
			isPrimary: isPrimaryArray,
		}).subscribe({
			next: (uploadedImages) => {
				// Add uploaded images to existing images array
				this.productImages = [...this.productImages, ...uploadedImages];
				
				// Clear uploaded files and previews
				this.uploadedFiles = [];
				this.imagePreviewUrls = [];
				
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Product images uploaded successfully',
				});
				
				// Reload product images to get updated state
				this.productService.getProductImages(productId).subscribe({
					next: (images) => {
						this.productImages = images;
						this.loading = false;
						this.cdr.markForCheck();
					},
					error: () => {
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
			},
			error: (error) => {
				console.error('Image upload error:', error);
				
				// Determine error message based on error type
				let errorMessage = 'Product saved but failed to upload images. ';
				
				if (error?.error?.message) {
					errorMessage += error.error.message;
				} else if (error?.status === 400) {
					errorMessage += 'Invalid file format or file too large. Please check your images and try again.';
				} else if (error?.status === 404) {
					errorMessage += 'Product not found. Please refresh and try again.';
				} else if (error?.status === 413) {
					errorMessage += 'File size too large. Maximum size is 50MB per file.';
				} else if (error?.status === 0 || error?.status === undefined) {
					errorMessage += 'Network error. Please check your connection and try again.';
				} else {
					errorMessage += 'Please try uploading images again.';
				}
				
				this.messageService.add({
					severity: 'warn',
					summary: 'Warning',
					detail: errorMessage,
					life: 5000,
				});
				
				// Don't clear uploaded files on error so user can retry
				// Reload product to get current state
				if (this.productId) {
					this.productService.getProductById(this.productId).subscribe({
						next: (fullProduct) => {
							this.productImages = fullProduct.images || [];
							this.loading = false;
							this.cdr.markForCheck();
							
							// Optionally close dialog if in dialog mode (user can choose to stay and retry)
							// Commented out to let user decide whether to retry or close
							// if (this.ref) {
							// 	this.ref.close(fullProduct);
							// }
						},
						error: () => {
							this.loading = false;
							this.cdr.markForCheck();
						},
					});
				} else {
					this.loading = false;
					this.cdr.markForCheck();
				}
			},
		});
	}

	isFormValid(): boolean {
		return !!(
			this.product.title &&
			this.product.shortDescription &&
			this.product.price &&
			this.product.material &&
			this.product.productSubCategoryId &&
			this.selectedCategoryId
		);
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
}

