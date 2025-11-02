import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// Data Services
import { ProductCategoryService } from '../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../core/dataservice/product-sub-category/product-sub-category.service';
import {
	ProductCategory,
	ProductSubCategory,
	CreateProductCategoryDto,
	UpdateProductCategoryDto,
	CreateProductSubCategoryDto,
	UpdateProductSubCategoryDto,
} from '../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-master-category',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService],
	templateUrl: './admin-master-category.component.html',
	styleUrls: ['./admin-master-category.component.css'],
})
export class AdminMasterCategoryComponent implements OnInit {
	// Categories
	categories: ProductCategory[] = [];
	selectedCategories: ProductCategory[] = [];
	categoryDialog: boolean = false;
	deleteCategoryDialog: boolean = false;
	deleteCategoriesDialog: boolean = false;
	category: Partial<ProductCategory> = {};
	submitted: boolean = false;

	// Sub-categories
	subCategories: ProductSubCategory[] = [];
	selectedSubCategories: ProductSubCategory[] = [];
	subCategoryDialog: boolean = false;
	deleteSubCategoryDialog: boolean = false;
	deleteSubCategoriesDialog: boolean = false;
	subCategory: Partial<ProductSubCategory> = {};
	subSubmitted: boolean = false;

	// UI State
	loading: boolean = false;
	activeTab: string = 'categories';

	constructor(
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService
	) {}

	ngOnInit() {
		this.loadCategories();
		this.loadSubCategories();
	}

	// Categories Methods
	loadCategories() {
		this.loading = true;
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				this.loading = false;
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load categories',
				});
				this.loading = false;
			},
		});
	}

	openNewCategory() {
		this.category = {};
		this.submitted = false;
		this.categoryDialog = true;
	}

	deleteSelectedCategories() {
		this.deleteCategoriesDialog = true;
	}

	editCategory(category: ProductCategory) {
		this.category = { ...category };
		this.categoryDialog = true;
	}

	deleteCategory(category: ProductCategory) {
		this.deleteCategoryDialog = true;
		this.category = { ...category };
	}

	confirmDeleteSelected() {
		this.deleteCategoriesDialog = false;
		// Implementation for bulk delete
		this.selectedCategories.forEach((cat) => {
			if (cat.id) {
				this.categoryService.deleteCategory(cat.id).subscribe({
					next: () => {
						this.categories = this.categories.filter(
							(val) => val.id !== cat.id
						);
					},
				});
			}
		});
		this.messageService.add({
			severity: 'success',
			summary: 'Successful',
			detail: 'Categories Deleted',
		});
		this.selectedCategories = [];
	}

	confirmDelete() {
		this.deleteCategoryDialog = false;
		if (this.category.id) {
			this.categoryService.deleteCategory(this.category.id).subscribe({
				next: () => {
					this.categories = this.categories.filter(
						(val) => val.id !== this.category.id
					);
					this.messageService.add({
						severity: 'success',
						summary: 'Successful',
						detail: 'Category Deleted',
					});
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete category',
					});
				},
			});
		}
		this.category = {};
	}

	hideDialog() {
		this.categoryDialog = false;
		this.submitted = false;
	}

	saveCategory() {
		this.submitted = true;

		if (this.category.name?.trim()) {
			if (this.category.id) {
				// Update existing category
				const updateData: UpdateProductCategoryDto = {
					name: this.category.name,
					description: this.category.description,
					isActive: this.category.isActive,
				};

				this.categoryService
					.updateCategory(this.category.id, updateData)
					.subscribe({
						next: (updatedCategory) => {
							const index = this.categories.findIndex(
								(c) => c.id === this.category.id
							);
							if (index !== -1) {
								this.categories[index] = updatedCategory;
							}
							this.messageService.add({
								severity: 'success',
								summary: 'Successful',
								detail: 'Category Updated',
							});
						},
						error: () => {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: 'Failed to update category',
							});
						},
					});
			} else {
				// Create new category
				const createData: CreateProductCategoryDto = {
					name: this.category.name,
					description: this.category.description,
					isActive: this.category.isActive ?? true,
				};

				this.categoryService.createCategory(createData).subscribe({
					next: (newCategory) => {
						this.categories.push(newCategory);
						this.messageService.add({
							severity: 'success',
							summary: 'Successful',
							detail: 'Category Created',
						});
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to create category',
						});
					},
				});
			}

			this.categories = [...this.categories];
			this.categoryDialog = false;
			this.category = {};
		}
	}

	// Sub-categories Methods
	loadSubCategories() {
		this.subCategoryService.getSubCategories().subscribe({
			next: (data) => {
				this.subCategories = data;
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

	openNewSubCategory() {
		this.subCategory = {};
		this.subSubmitted = false;
		this.subCategoryDialog = true;
	}

	editSubCategory(subCategory: ProductSubCategory) {
		this.subCategory = { ...subCategory };
		this.subCategoryDialog = true;
	}

	deleteSubCategory(subCategory: ProductSubCategory) {
		this.deleteSubCategoryDialog = true;
		this.subCategory = { ...subCategory };
	}

	confirmDeleteSubCategory() {
		this.deleteSubCategoryDialog = false;
		if (this.subCategory.id) {
			this.subCategoryService.deleteSubCategory(this.subCategory.id).subscribe({
				next: () => {
					this.subCategories = this.subCategories.filter(
						(val) => val.id !== this.subCategory.id
					);
					this.messageService.add({
						severity: 'success',
						summary: 'Successful',
						detail: 'Sub-category Deleted',
					});
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete sub-category',
					});
				},
			});
		}
		this.subCategory = {};
	}

	hideSubDialog() {
		this.subCategoryDialog = false;
		this.subSubmitted = false;
	}

	saveSubCategory() {
		this.subSubmitted = true;

		if (this.subCategory.name?.trim() && this.subCategory.productCategoryId) {
			if (this.subCategory.id) {
				// Update existing sub-category
				const updateData: UpdateProductSubCategoryDto = {
					name: this.subCategory.name,
					description: this.subCategory.description,
					productCategoryId: this.subCategory.productCategoryId,
					isActive: this.subCategory.isActive,
				};

				this.subCategoryService
					.updateSubCategory(this.subCategory.id, updateData)
					.subscribe({
						next: (updatedSubCategory) => {
							const index = this.subCategories.findIndex(
								(c) => c.id === this.subCategory.id
							);
							if (index !== -1) {
								this.subCategories[index] = updatedSubCategory;
							}
							this.messageService.add({
								severity: 'success',
								summary: 'Successful',
								detail: 'Sub-category Updated',
							});
						},
						error: () => {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: 'Failed to update sub-category',
							});
						},
					});
			} else {
				// Create new sub-category
				const createData: CreateProductSubCategoryDto = {
					name: this.subCategory.name,
					description: this.subCategory.description,
					productCategoryId: this.subCategory.productCategoryId,
					isActive: this.subCategory.isActive ?? true,
				};

				this.subCategoryService.createSubCategory(createData).subscribe({
					next: (newSubCategory) => {
						this.subCategories.push(newSubCategory);
						this.messageService.add({
							severity: 'success',
							summary: 'Successful',
							detail: 'Sub-category Created',
						});
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to create sub-category',
						});
					},
				});
			}

			this.subCategories = [...this.subCategories];
			this.subCategoryDialog = false;
			this.subCategory = {};
		}
	}

	getCategoryName(categoryId: number): string {
		const category = this.categories.find((c) => c.id === categoryId);
		return category?.name || '';
	}

	getStatusSeverity(isActive: boolean): string {
		return isActive ? 'success' : 'danger';
	}

	getStatusText(isActive: boolean): string {
		return isActive ? 'Active' : 'Inactive';
	}
}
