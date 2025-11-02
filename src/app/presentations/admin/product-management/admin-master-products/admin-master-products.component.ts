import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// Data Services
import { ProductService } from '../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../core/dataservice/product-sub-category/product-sub-category.service';
import {
	Product,
	CreateProductDto,
	UpdateProductDto,
	ProductImage,
} from '../../../../core/dataservice/product/product.interface';
import {
	ProductCategory,
	ProductSubCategory,
} from '../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { environment } from '../../../../../environments/environment';
import { ImageUtilityService } from '../../../../core/utility/image-utility.service';

@Component({
	selector: 'app-admin-master-products',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService],
	templateUrl: './admin-master-products.component.html',
	styleUrls: ['./admin-master-products.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMasterProductsComponent implements OnInit {
	@ViewChild('fileUpload') fileUpload!: ElementRef;

	// Products
	products: Product[] = [];
	selectedProducts: Product[] = [];
	productDialog: boolean = false;
	deleteProductDialog: boolean = false;
	deleteProductsDialog: boolean = false;
	product: Partial<Product> = {};
	submitted: boolean = false;

	// Categories and Sub-categories
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];
	filteredSubCategories: ProductSubCategory[] = [];

	// Image Management
	productImages: ProductImage[] = [];
	imageDialog: boolean = false;
	selectedFiles: File[] = [];

	// UI State
	loading: boolean = false;
	viewMode: 'grid' | 'table' = 'table';
	selectedCategoryId: number | undefined; // Filter Options
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
		private imageUtilityService: ImageUtilityService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadProducts();
		this.loadCategories();
		this.loadSubCategories();
	}

	// Load Data Methods
	loadProducts() {
		this.loading = true;
		this.cdr.markForCheck();
		this.productService.getAllProductsAdmin().subscribe({
			next: (data) => {
				this.products = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load products',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	loadCategories() {
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
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
				this.filteredSubCategories = data;
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load sub-categories',
				});
			},
		});
	}

	// Product CRUD Methods
	openNew() {
		this.product = {
			isAvailable: true,
			stockQuantity: 0,
			price: 0,
			weight: 0,
			rating: 0,
			salesCount: 0,
		};
		this.selectedCategoryId = undefined;
		this.filteredSubCategories = this.subCategories;
		this.submitted = false;
		this.productDialog = true;
	}

	deleteSelectedProducts() {
		this.deleteProductsDialog = true;
	}

	editProduct(product: Product) {
		this.product = { ...product };
		this.selectedCategoryId = product.productSubCategory?.productCategoryId;
		this.filterSubCategoriesByCategory(
			product.productSubCategory?.productCategoryId
		);
		this.productDialog = true;
	}

	deleteProduct(product: Product) {
		this.deleteProductDialog = true;
		this.product = { ...product };
	}

	confirmDeleteSelected() {
		this.deleteProductsDialog = false;
		this.selectedProducts.forEach((prod) => {
			if (prod.id) {
				this.productService.deleteProduct(prod.id).subscribe({
					next: () => {
						this.products = this.products.filter((val) => val.id !== prod.id);
					},
				});
			}
		});
		this.messageService.add({
			severity: 'success',
			summary: 'Successful',
			detail: 'Products Deleted',
		});
		this.selectedProducts = [];
	}

	confirmDelete() {
		this.deleteProductDialog = false;
		if (this.product.id) {
			this.productService.deleteProduct(this.product.id).subscribe({
				next: () => {
					this.products = this.products.filter(
						(val) => val.id !== this.product.id
					);
					this.messageService.add({
						severity: 'success',
						summary: 'Successful',
						detail: 'Product Deleted',
					});
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete product',
					});
				},
			});
		}
		this.product = {};
	}

	hideDialog() {
		this.productDialog = false;
		this.submitted = false;
	}

	saveProduct() {
		this.submitted = true;

		if (this.product.title?.trim() && this.product.productSubCategoryId) {
			if (this.product.id) {
				// Update existing product
				const updateData: UpdateProductDto = {
					title: this.product.title,
					shortDescription: this.product.shortDescription,
					detailedDescription: this.product.detailedDescription,
					dimensions: this.product.dimensions,
					weight: this.product.weight,
					price: this.product.price,
					material: this.product.material,
					stockQuantity: this.product.stockQuantity,
					isAvailable: this.product.isAvailable,
					productSubCategoryId: this.product.productSubCategoryId,
				};

				this.productService
					.updateProduct(this.product.id, updateData)
					.subscribe({
						next: (updatedProduct) => {
							const index = this.products.findIndex(
								(p) => p.id === this.product.id
							);
							if (index !== -1) {
								this.products[index] = updatedProduct;
							}
							this.messageService.add({
								severity: 'success',
								summary: 'Successful',
								detail: 'Product Updated',
							});
						},
						error: () => {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: 'Failed to update product',
							});
						},
					});
			} else {
				// Create new product
				const createData: CreateProductDto = {
					title: this.product.title,
					shortDescription: this.product.shortDescription || '',
					detailedDescription: this.product.detailedDescription || '',
					dimensions: this.product.dimensions || '',
					weight: this.product.weight || 0,
					price: this.product.price || 0,
					material: this.product.material || '',
					stockQuantity: this.product.stockQuantity || 0,
					isAvailable: this.product.isAvailable ?? true,
					productSubCategoryId: this.product.productSubCategoryId,
				};

				this.productService.createProduct(createData).subscribe({
					next: (newProduct) => {
						this.products.push(newProduct);
						this.messageService.add({
							severity: 'success',
							summary: 'Successful',
							detail: 'Product Created',
						});
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to create product',
						});
					},
				});
			}

			this.products = [...this.products];
			this.productDialog = false;
			this.product = {};
		}
	}

	// Category and Sub-category Methods
	onCategoryChange(categoryId: number) {
		this.selectedCategoryId = categoryId;
		this.filterSubCategoriesByCategory(categoryId);
		this.product.productSubCategoryId = undefined;
	}

	filterSubCategoriesByCategory(categoryId?: number) {
		if (categoryId) {
			this.filteredSubCategories = this.subCategories.filter(
				(sub) => sub.productCategoryId === categoryId
			);
		} else {
			this.filteredSubCategories = this.subCategories;
		}
	}

	// Image Management Methods
	openImageDialog(product: Product) {
		this.product = { ...product };
		this.loadProductImages(product.id!);
		this.imageDialog = true;
	}

	loadProductImages(productId: number) {
		this.productService.getProductImages(productId).subscribe({
			next: (images) => {
				this.productImages = images;
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load product images',
				});
			},
		});
	}

	onFileSelect(event: any) {
		this.selectedFiles = Array.from(event.files);
	}

	uploadImages() {
		if (this.selectedFiles.length > 0 && this.product.id) {
			const metadata = {
				orientations: this.selectedFiles.map(() => 'landscape'),
				altTexts: this.selectedFiles.map((file) => file.name),
				isPrimary: this.selectedFiles.map(
					(_, index) => index === 0 && this.productImages.length === 0
				),
			};

			this.productService
				.uploadProductImages(this.product.id, this.selectedFiles, metadata)
				.subscribe({
					next: (images) => {
						this.productImages.push(...images);
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Images uploaded successfully',
						});
						this.selectedFiles = [];
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to upload images',
						});
					},
				});
		}
	}

	setPrimaryImage(imageId: number) {
		if (this.product.id) {
			this.productService.setPrimaryImage(this.product.id, imageId).subscribe({
				next: () => {
					this.loadProductImages(this.product.id!);
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Primary image updated',
					});
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to update primary image',
					});
				},
			});
		}
	}

	deleteImage(imageId: number) {
		if (this.product.id) {
			this.productService
				.deleteProductImage(this.product.id, imageId)
				.subscribe({
					next: () => {
						this.productImages = this.productImages.filter(
							(img) => img.id !== imageId
						);
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Image deleted',
						});
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to delete image',
						});
					},
				});
		}
	}

	// Utility Methods
	getPrimaryImage(product: Product): string {
		const primaryImage = product.images?.find((img) => img.isPrimary);
		console.log('Primary Image:', primaryImage);
		return primaryImage
			? `${environment.BASEAPI_URL}${primaryImage.imagePath}`
			: '';
	}

	getImageUrl(imagePath: string): string {
		return `${environment.BASEAPI_URL}${imagePath}`;
	}

	getSubCategoryName(subCategoryId: number): string {
		const subCategory = this.subCategories.find(
			(sub) => sub.id === subCategoryId
		);
		return subCategory?.name || '';
	}

	getCategoryFromSubCategory(subCategoryId: number): string {
		const subCategory = this.subCategories.find(
			(sub) => sub.id === subCategoryId
		);
		if (subCategory) {
			const category = this.categories.find(
				(cat) => cat.id === subCategory.productCategoryId
			);
			return category?.name || '';
		}
		return '';
	}

	// TrackBy functions for performance
	trackByProductId(index: number, product: Product): number {
		return product.id || index;
	}

	trackByImageId(index: number, image: ProductImage): number {
		return image.id || index;
	}

	trackByCategoryId(index: number, category: ProductCategory): number {
		return category.id || index;
	}

	trackBySubCategoryId(index: number, subCategory: ProductSubCategory): number {
		return subCategory.id || index;
	}
}
