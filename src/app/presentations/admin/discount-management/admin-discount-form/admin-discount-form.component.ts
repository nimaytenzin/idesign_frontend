import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import {
	DiscountResponseDto,
	CreateDiscountDto,
	UpdateDiscountDto,
	DiscountType,
	DiscountValueType,
	DiscountScope,
} from '../../../../core/dataservice/discount/discount.interface';
import { DiscountService } from '../../../../core/dataservice/discount/discount.service';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../core/dataservice/product-sub-category/product-sub-category.service';
import { Product } from '../../../../core/dataservice/product/product.interface';
import { ProductCategory, ProductSubCategory } from '../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-discount-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-discount-form.component.html',
	styleUrls: ['./admin-discount-form.component.scss'],
})
export class AdminDiscountFormComponent implements OnInit {
	discount: Partial<CreateDiscountDto & { startDate?: Date | string; endDate?: Date | string }> = {};
	isEditMode: boolean = false;
	submitted: boolean = false;
	loading: boolean = false;

	// Options
	discountTypeOptions = [
		{ label: 'All Products', value: DiscountType.FLAT_ALL_PRODUCTS },
		{ label: 'Selected Products', value: DiscountType.FLAT_SELECTED_PRODUCTS },
		{ label: 'Selected Categories', value: DiscountType.FLAT_SELECTED_CATEGORIES },
	];

	valueTypeOptions = [
		{ label: 'Percentage', value: DiscountValueType.PERCENTAGE },
		{ label: 'Fixed Amount', value: DiscountValueType.FIXED_AMOUNT },
	];

	scopeOptions = [
		{ label: 'Per Product', value: DiscountScope.PER_PRODUCT },
		{ label: 'Order Total', value: DiscountScope.ORDER_TOTAL },
	];

	// Data for selections
	products: Product[] = [];
	categories: ProductCategory[] = [];
	subCategories: ProductSubCategory[] = [];
	selectedProducts: number[] = [];
	selectedCategories: ProductCategory[] = [];
	selectedSubCategories: ProductSubCategory[] = [];

	// Filtered subcategories based on selected categories
	filteredSubCategories: ProductSubCategory[] = [];

	DiscountType = DiscountType;
	DiscountValueType = DiscountValueType;
	DiscountScope = DiscountScope;

	getMaxValue(): number | null {
		return this.discount.valueType === DiscountValueType.PERCENTAGE ? 100 : null;
	}

	constructor(
		private discountService: DiscountService,
		private productService: ProductService,
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		// Check if editing existing discount
		if (this.config.data?.discount) {
			const discountData = this.config.data.discount as DiscountResponseDto;
			this.discount = {
				name: discountData.name,
				description: discountData.description,
				discountType: discountData.discountType,
				valueType: discountData.valueType,
				discountValue: discountData.discountValue,
				discountScope: discountData.discountScope,
				startDate: new Date(discountData.startDate) as any,
				endDate: new Date(discountData.endDate) as any,
				isActive: discountData.isActive,
				maxUsageCount: discountData.maxUsageCount ?? undefined,
				minOrderValue: discountData.minOrderValue ?? undefined,
				voucherCode: discountData.voucherCode ?? undefined,
			};
			this.isEditMode = true;
		} else {
			// Initialize with defaults
			const now = new Date();
			const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
			this.discount = {
				discountType: DiscountType.FLAT_ALL_PRODUCTS,
				valueType: DiscountValueType.PERCENTAGE,
				discountScope: DiscountScope.PER_PRODUCT,
				isActive: true,
				startDate: now as any,
				endDate: endDate as any,
			};
		}
	}

	ngOnInit() {
		this.loadProducts();
		this.loadCategories();
		this.loadSubCategories();
		if (this.isEditMode && this.config.data?.discount) {
			this.loadEditData();
		}
	}

	loadProducts() {
		this.productService.getAllProductsAdmin().subscribe({
			next: (data) => {
				this.products = data;
				if (this.isEditMode && this.discount.productIds) {
					this.selectedProducts = this.discount.productIds.filter((id) => id !== null && id !== undefined) as number[];
				}
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load products',
				});
			},
		});
	}

	loadCategories() {
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				if (this.isEditMode && this.discount.categoryIds) {
					this.selectedCategories = this.categories.filter((c) =>
						this.discount.categoryIds?.includes(c.id)
					);
					this.updateFilteredSubCategories();
				}
				this.cdr.markForCheck();
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
				if (this.isEditMode && this.discount.subCategoryIds) {
					this.selectedSubCategories = this.subCategories.filter((sc) =>
						this.discount.subCategoryIds?.includes(sc.id)
					);
				}
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load subcategories',
				});
			},
		});
	}

	loadEditData() {
		// Edit mode data loading is handled in loadProducts, loadCategories, loadSubCategories
		// after the data is fetched
	}

	onDiscountTypeChange() {
		// Clear selections when type changes
		this.selectedProducts = [];
		this.selectedCategories = [];
		this.selectedSubCategories = [];
		this.discount.productIds = undefined;
		this.discount.categoryIds = undefined;
		this.discount.subCategoryIds = undefined;
		this.updateFilteredSubCategories();
	}

	onCategorySelectionChange() {
		this.discount.categoryIds = this.selectedCategories.map((c) => c.id);
		this.updateFilteredSubCategories();
		// Clear subcategory selection if category is removed
		this.selectedSubCategories = this.selectedSubCategories.filter((sc) =>
			this.selectedCategories.some((c) => c.id === sc.productCategoryId)
		);
		this.discount.subCategoryIds = this.selectedSubCategories.map((sc) => sc.id);
	}

	onSubCategorySelectionChange() {
		this.discount.subCategoryIds = this.selectedSubCategories.map((sc) => sc.id);
	}

	onProductSelectionChange() {
		// Filter out any null/undefined values and ensure we have valid numbers
		this.discount.productIds = this.selectedProducts.filter((id) => id !== null && id !== undefined && typeof id === 'number') as number[];
	}

	updateFilteredSubCategories() {
		if (this.selectedCategories.length === 0) {
			this.filteredSubCategories = this.subCategories;
		} else {
			const selectedCategoryIds = this.selectedCategories.map((c) => c.id);
			this.filteredSubCategories = this.subCategories.filter((sc) =>
				selectedCategoryIds.includes(sc.productCategoryId)
			);
		}
	}

	onValueTypeChange() {
		// Reset discount value if switching types
		if (this.discount.valueType === DiscountValueType.PERCENTAGE) {
			// Ensure percentage is between 0-100
			if (this.discount.discountValue && this.discount.discountValue > 100) {
				this.discount.discountValue = 100;
			}
		}
	}

	validateForm(): boolean {
		this.submitted = true;

		if (!this.discount.name || !this.discount.name.trim()) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Discount name is required',
			});
			return false;
		}

		if (!this.discount.discountType) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Discount type is required',
			});
			return false;
		}

		if (!this.discount.valueType) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Value type is required',
			});
			return false;
		}

		if (this.discount.discountValue === undefined || this.discount.discountValue === null) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Discount value is required',
			});
			return false;
		}

		if (this.discount.valueType === DiscountValueType.PERCENTAGE) {
			if (this.discount.discountValue < 0 || this.discount.discountValue > 100) {
				this.messageService.add({
					severity: 'error',
					summary: 'Validation Error',
					detail: 'Percentage must be between 0 and 100',
				});
				return false;
			}
		} else {
			if (this.discount.discountValue < 0) {
				this.messageService.add({
					severity: 'error',
					summary: 'Validation Error',
					detail: 'Fixed amount must be greater than or equal to 0',
				});
				return false;
			}
		}

		if (!this.discount.startDate) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Start date is required',
			});
			return false;
		}

		if (!this.discount.endDate) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'End date is required',
			});
			return false;
		}

		if (new Date(this.discount.startDate) >= new Date(this.discount.endDate)) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'End date must be after start date',
			});
			return false;
		}

		// Validate based on discount type
		if (this.discount.discountType === DiscountType.FLAT_SELECTED_PRODUCTS) {
			if (!this.discount.productIds || this.discount.productIds.length === 0) {
				this.messageService.add({
					severity: 'error',
					summary: 'Validation Error',
					detail: 'At least one product must be selected',
				});
				return false;
			}
		}

		if (this.discount.discountType === DiscountType.FLAT_SELECTED_CATEGORIES) {
			if (
				(!this.discount.categoryIds || this.discount.categoryIds.length === 0) &&
				(!this.discount.subCategoryIds || this.discount.subCategoryIds.length === 0)
			) {
				this.messageService.add({
					severity: 'error',
					summary: 'Validation Error',
					detail: 'At least one category or subcategory must be selected',
				});
				return false;
			}
		}

		return true;
	}

	getMinDate(): Date | undefined {
		if (!this.discount.startDate) return undefined;
		const startDate = this.discount.startDate as Date | string;
		const date = startDate instanceof Date 
			? startDate 
			: new Date(startDate);
		return date;
	}

	saveDiscount() {
		if (!this.validateForm()) {
			return;
		}

		this.loading = true;

		// Convert dates to ISO strings if they are Date objects
		const startDateValue = this.discount.startDate as Date | string | undefined;
		const endDateValue = this.discount.endDate as Date | string | undefined;
		
		const startDate =
			startDateValue instanceof Date
				? startDateValue.toISOString()
				: (startDateValue as string);
		const endDate =
			endDateValue instanceof Date
				? endDateValue.toISOString()
				: (endDateValue as string);

		// Prepare the data
		const discountData: CreateDiscountDto | UpdateDiscountDto = {
			name: this.discount.name!,
			description: this.discount.description,
			discountType: this.discount.discountType!,
			valueType: this.discount.valueType!,
			discountValue: this.discount.discountValue!,
			discountScope: this.discount.discountScope || DiscountScope.PER_PRODUCT,
			startDate: startDate,
			endDate: endDate,
			isActive: this.discount.isActive !== undefined ? this.discount.isActive : true,
			maxUsageCount: this.discount.maxUsageCount,
			minOrderValue: this.discount.minOrderValue,
			voucherCode: this.discount.voucherCode,
		};

		// Add type-specific fields
		if (this.discount.discountType === DiscountType.FLAT_SELECTED_PRODUCTS) {
			// Filter out any null/undefined values before sending
			discountData.productIds = this.discount.productIds?.filter((id) => id !== null && id !== undefined && typeof id === 'number') as number[] || [];
		}

		if (this.discount.discountType === DiscountType.FLAT_SELECTED_CATEGORIES) {
			discountData.categoryIds = this.discount.categoryIds;
			discountData.subCategoryIds = this.discount.subCategoryIds;
		}

		if (this.isEditMode && this.config.data?.discount) {
			const discountId = (this.config.data.discount as DiscountResponseDto).id;
			this.discountService.updateDiscount(discountId, discountData as UpdateDiscountDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Discount updated successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update discount',
					});
					this.loading = false;
				},
			});
		} else {
			this.discountService.createDiscount(discountData as CreateDiscountDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Discount created successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create discount',
					});
					this.loading = false;
				},
			});
		}
	}

	cancel() {
		this.ref.close(false);
	}

	getCategoryName(categoryId: number): string {
		const category = this.categories.find((c) => c.id === categoryId);
		return category?.name || '';
	}
}

