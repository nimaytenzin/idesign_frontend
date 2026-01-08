import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../core/dataservice/product-sub-category/product-sub-category.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../../../core/dataservice/product/product.interface';
import { ProductCategory, ProductSubCategory } from '../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-product-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './product-form.component.html',
	styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
	productId: number | null = null;
	isEditMode: boolean = false;
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
	};

	// Categories
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];
	filteredSubCategories: ProductSubCategory[] = [];

	// Images
	productImages: any[] = [];
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
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit() {
		this.loadCategories();
		
		// Check if product data is passed via dialog config
		if (this.config.data?.product) {
			this.productId = this.config.data.product.id;
			this.isEditMode = true;
			this.loadProduct();
		} else if (this.config.data?.productId) {
			this.productId = this.config.data.productId;
				this.isEditMode = true;
				this.loadProduct();
		} else if (this.config.data?.duplicateProductId) {
			// Handle duplicate product scenario
			this.productId = this.config.data.duplicateProductId;
			this.isEditMode = false; // Create mode, but load data to duplicate
			this.loadProductForDuplicate();
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
				this.updateFilteredSubCategories();
				this.cdr.markForCheck();
			},
		});
	}

	updateFilteredSubCategories() {
		if (this.product.productSubCategoryId) {
			const selectedSub = this.subCategories.find((s) => s.id === this.product.productSubCategoryId);
			if (selectedSub) {
				this.filteredSubCategories = this.subCategories.filter(
					(s) => s.productCategoryId === selectedSub.productCategoryId
				);
			} else {
				this.filteredSubCategories = this.subCategories;
			}
		} else {
			this.filteredSubCategories = this.subCategories;
		}
	}

	onCategoryChange() {
		this.updateFilteredSubCategories();
		if (this.filteredSubCategories.length > 0) {
			this.product.productSubCategoryId = this.filteredSubCategories[0].id;
		}
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
				this.cdr.markForCheck();
			},
		});
	}

	loadProductForDuplicate() {
		if (!this.productId) return;
		this.loading = true;
		this.productService.getProductById(this.productId).subscribe({
			next: (data) => {
				// Load product data but clear ID and title to indicate it's a duplicate
				this.product = {
					title: `${data.title} (Copy)`,
					shortDescription: data.shortDescription,
					detailedDescription: data.detailedDescription,
					dimensions: data.dimensions,
					weight: data.weight,
					price: data.price,
					material: data.material,
					isAvailable: data.isAvailable,
					isFeatured: false, // Don't duplicate featured status
					productSubCategoryId: data.productSubCategoryId,
				} as Partial<CreateProductDto>;
				this.productImages = []; // Don't duplicate images
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
			const updateData: UpdateProductDto = { ...this.product };
			this.productService.updateProduct(this.productId, updateData).subscribe({
				next: (updatedProduct) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Product updated successfully',
					});
					this.ref.close(updatedProduct); // Close dialog and return updated product
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
			const createData: CreateProductDto = this.product as CreateProductDto;
			this.productService.createProduct(createData).subscribe({
				next: (createdProduct) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Product created successfully',
					});
					this.ref.close(createdProduct); // Close dialog and return created product
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

	isFormValid(): boolean {
		return !!(
			this.product.title &&
			this.product.shortDescription &&
			this.product.price &&
			this.product.material &&
			this.product.productSubCategoryId
		);
	}

	cancel() {
		this.ref.close(); // Close dialog without returning data
	}

	getImageUrl(imagePath: string): string {
		if (imagePath.startsWith('http')) {
			return imagePath;
		}
		return `${environment.BASEAPI_URL}/${imagePath}`;
	}

	getCategoryName(categoryId: number): string {
		const category = this.categories.find((c) => c.id === categoryId);
		return category?.name || '';
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}
}

