import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductCategoryService } from '../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../core/dataservice/product-sub-category/product-sub-category.service';
import {
	ProductCategory,
	ProductSubCategory,
} from '../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { CreateCategoryComponent } from '../components/create-category/create-category.component';
import { UpdateCategoryComponent } from '../components/update-category/update-category.component';
import { CreateSubcategoryComponent } from '../components/create-subcategory/create-subcategory.component';
import { UpdateSubcategoryComponent } from '../components/update-subcategory/update-subcategory.component';

@Component({
	selector: 'app-admin-list-categories',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		PrimeNgModules,
	],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-list-categories.component.html',
	styleUrls: ['./admin-list-categories.component.scss'],
})
export class AdminListCategoriesComponent implements OnInit {
	// Data
	public categories: ProductCategory[] = [];
	public subCategories: ProductSubCategory[] = [];

	// Filters
	public searchFilter: string = '';

	// UI State
	public loading: boolean = false;

	// Selection state
	public selectedCategoryId: number | null = null;
	public selectedCategory: ProductCategory | null = null;
	public dialogRef?: DynamicDialogRef;

	constructor(
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadCategories();
		this.loadSubCategories();
	}

	public loadCategories(): void {
		this.loading = true;
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				this.loading = false;
				// Auto-select the first category if available and none is selected
				if (data.length > 0 && !this.selectedCategory) {
					this.selectCategory(data[0]);
				}
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load categories',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	public loadSubCategories(): void {
		this.subCategoryService.getSubCategories().subscribe({
			next: (data) => {
				this.subCategories = data;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load sub categories',
				});
			},
		});
	}

	public getFilteredCategories(): ProductCategory[] {
		if (!this.searchFilter) {
		return this.categories;
	}
		const filter = this.searchFilter.toLowerCase();
		return this.categories.filter(
			(cat) =>
				cat.name.toLowerCase().includes(filter) ||
				(cat.description && cat.description.toLowerCase().includes(filter))
		);
	}

	public getSubCategoriesForCategory(categoryId: number): ProductSubCategory[] {
		return this.subCategories.filter((sub) => sub.productCategoryId === categoryId);
	}

	// Selection methods
	public selectCategory(category: ProductCategory): void {
		this.selectedCategoryId = category.id!;
		this.selectedCategory = category;
	}

	// Dialog methods
	public openNewCategory(): void {
		this.dialogRef = this.dialogService.open(CreateCategoryComponent, {
			header: 'New Category',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadCategories();
				this.loadSubCategories();
				// Select the newly created category if it exists
				if (result.id) {
					const newCategory = this.categories.find(c => c.id === result.id);
					if (newCategory) {
						this.selectCategory(newCategory);
					}
				}
			}
		});
	}

	public editCategory(category: ProductCategory): void {
		this.dialogRef = this.dialogService.open(UpdateCategoryComponent, {
			header: 'Edit Category',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { category },
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadCategories();
				this.loadSubCategories();
				// Update the selected category
				if (this.selectedCategory && result.id === this.selectedCategory.id) {
					const updatedCategory = this.categories.find(c => c.id === result.id);
					if (updatedCategory) {
						this.selectCategory(updatedCategory);
					}
				}
			}
		});
	}

	public deleteCategory(category: ProductCategory): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
			header: 'Delete Category',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.categoryService.deleteCategory(category.id!).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Category deleted successfully',
						});
						this.loadCategories();
						this.loadSubCategories();
						// Clear selection if deleted category was selected
						if (this.selectedCategoryId === category.id) {
							this.selectedCategoryId = null;
							this.selectedCategory = null;
						}
						this.loading = false;
					},
					error: (error) => {
						let errorMessage = 'Failed to delete category';
						if (error.error?.message) {
							if (typeof error.error.message === 'string') {
								errorMessage = error.error.message;
							}
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
			},
		});
	}

	public openNewSubCategory(categoryId: number): void {
		this.dialogRef = this.dialogService.open(CreateSubcategoryComponent, {
			header: 'New Subcategory',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				categories: this.categories,
				categoryId: categoryId,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadSubCategories();
			}
		});
	}

	public editSubCategory(subCategory: ProductSubCategory): void {
		this.dialogRef = this.dialogService.open(UpdateSubcategoryComponent, {
			header: 'Edit Subcategory',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				subcategory: subCategory,
				categories: this.categories,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadSubCategories();
			}
		});
	}

	public deleteSubCategory(subCategory: ProductSubCategory): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${subCategory.name}"? This action cannot be undone.`,
			header: 'Delete Subcategory',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.subCategoryService.deleteSubCategory(subCategory.id!).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Subcategory deleted successfully',
						});
						this.loadSubCategories();
						this.loading = false;
					},
					error: (error) => {
						let errorMessage = 'Failed to delete subcategory';
						if (error.error?.message) {
							if (typeof error.error.message === 'string') {
								errorMessage = error.error.message;
							}
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
			},
		});
	}

	// Helper methods
	public getStatusClasses(isActive: boolean | undefined): string {
		if (isActive !== false) {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-green-50 text-green-700 dark:bg-green-500 dark:bg-opacity-15 dark:text-green-500';
		} else {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-red-50 text-red-700 dark:bg-red-500 dark:bg-opacity-15 dark:text-red-500';
		}
	}

}
