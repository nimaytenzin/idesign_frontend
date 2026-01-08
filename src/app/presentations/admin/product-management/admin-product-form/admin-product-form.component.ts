import { Component, OnInit, ChangeDetectorRef, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../core/dataservice/product-sub-category/product-sub-category.service';
import { Product, CreateProductDto, UpdateProductDto, ProductImage } from '../../../../core/dataservice/product/product.interface';
import { ProductCategory, ProductSubCategory } from '../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-admin-product-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-product-form.component.html',
	styleUrls: ['./admin-product-form.component.scss'],
})
export class AdminProductFormComponent implements OnInit {
	productId: number | null = null;
	isEditMode: boolean = false;
	loading: boolean = false;
	submitted: boolean = false;
	isDialogMode: boolean = false;

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
		private cdr: ChangeDetectorRef,
		@Optional() private route?: ActivatedRoute,
		@Optional() private router?: Router,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {
		this.isDialogMode = !!this.ref && !!this.config;
	}

	ngOnInit() {
		this.loadCategories();

		if (this.isDialogMode && this.config) {
			// Dialog mode
			if (this.config.data?.product) {
				this.productId = this.config.data.product.id;
				this.isEditMode = true;
				this.loadProduct();
			} else if (this.config.data?.productId) {
				this.productId = this.config.data.productId;
				this.isEditMode = true;
				this.loadProduct();
			} else if (this.config.data?.duplicateProductId) {
				this.productId = this.config.data.duplicateProductId;
				this.isEditMode = false;
				this.loadProductForDuplicate();
			}
		} else if (this.route && this.router) {
			// Route mode
			this.route.params.subscribe((params) => {
				if (params['id']) {
					this.productId = +params['id'];
					this.isEditMode = true;
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
				if (!this.isDialogMode && this.router) {
					this.router.navigate(['/admin/products']);
				}
				this.cdr.markForCheck();
			},
		});
	}

	loadProductForDuplicate() {
		if (!this.productId) return;
		this.loading = true;
		this.productService.getProductById(this.productId).subscribe({
			next: (data) => {
				this.product = {
					title: `${data.title} (Copy)`,
					shortDescription: data.shortDescription,
					detailedDescription: data.detailedDescription,
					dimensions: data.dimensions,
					weight: data.weight,
					price: data.price,
					material: data.material,
					isAvailable: data.isAvailable,
					isFeatured: false,
					productSubCategoryId: data.productSubCategoryId,
					stockQuantity: data.stockQuantity,
				} as Partial<CreateProductDto>;
				this.productImages = [];
				this.updateFilteredSubCategories();
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

	saveProduct() {
		this.submitted = true;

		if (!this.isFormValid()) {
			return;
		}

		this.loading = true;

		if (this.isEditMode && this.productId) {
			// Update existing product
			const updateData: UpdateProductDto = { ...this.product };
			this.productService.updateProduct(this.productId, updateData).subscribe({
				next: (updatedProduct) => {
					// Upload images if any were selected
					if (this.uploadedFiles.length > 0) {
						this.uploadImages(updatedProduct.id, false);
					} else {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Product updated successfully',
						});
						if (this.isDialogMode && this.ref) {
							this.ref.close(updatedProduct);
						} else if (this.router) {
							this.router.navigate(['/admin/products']);
						}
					}
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to update product',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			// Create new product
			const createData: CreateProductDto = this.product as CreateProductDto;
			this.productService.createProduct(createData).subscribe({
				next: (createdProduct) => {
					// Upload images if any were selected
					if (this.uploadedFiles.length > 0) {
						this.uploadImages(createdProduct.id, true);
					} else {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Product created successfully',
						});
						if (this.isDialogMode && this.ref) {
							this.ref.close(createdProduct);
						} else if (this.router) {
							this.router.navigate(['/admin/products']);
						}
					}
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

	uploadImages(productId: number, isNewProduct: boolean) {
		// Determine if first image should be primary
		// For new products, always set first image as primary
		// For existing products, only set as primary if no existing images
		const hasExistingImages = this.productImages.length > 0;
		const isPrimaryArray = isNewProduct || !hasExistingImages 
			? this.uploadedFiles.map((_, index) => index === 0)
			: this.uploadedFiles.map(() => false);

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
					detail: isNewProduct 
						? 'Product created and images uploaded successfully'
						: 'Product updated and images uploaded successfully',
				});
				
				if (this.isDialogMode && this.ref) {
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
		if (this.isDialogMode && this.ref) {
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
}

