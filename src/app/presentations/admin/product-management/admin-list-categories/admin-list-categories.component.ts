import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TieredMenu } from 'primeng/tieredmenu';
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
import { Table } from 'primeng/table';

@Component({
	selector: 'app-admin-list-categories',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-list-categories.component.html',
	styleUrls: ['./admin-list-categories.component.scss'],
})
export class AdminListCategoriesComponent implements OnInit, AfterViewInit {
	@ViewChild('categoryTable') categoryTable!: Table;
	@ViewChild('subCategoryTable') subCategoryTable!: Table;
	@ViewChildren('actionMenu') actionMenuList!: QueryList<TieredMenu>;
	@ViewChildren('subActionMenu') subActionMenuList!: QueryList<TieredMenu>;

	// Data
	public categories: ProductCategory[] = [];
	public subCategories: ProductSubCategory[] = [];
	public selectedCategories: ProductCategory[] = [];
	public selectedSubCategories: ProductSubCategory[] = [];

	// Filters
	public globalFilter: string = '';
	public statusFilter: boolean | null = null;

	// Pagination
	public first: number = 0;
	public rows: number = 7;
	public totalRecords: number = 0;

	// Selection
	public selected: number[] = [];
	public selectedMap: { [key: number]: boolean } = {};
	public allSelected: boolean = false;

	// Action menu references
	public actionMenus: Map<number, TieredMenu> = new Map();
	public subActionMenus: Map<number, TieredMenu> = new Map();

	// UI State
	public loading: boolean = false;
	public categoryDialog: boolean = false;
	public subCategoryDialog: boolean = false;
	public deleteDialog: boolean = false;
	public categoryToDelete: ProductCategory | null = null;
	public subCategoryToDelete: ProductSubCategory | null = null;
	public dialogRef?: DynamicDialogRef;

	// Form Data
	public category: Partial<ProductCategory> = {};
	public subCategory: Partial<ProductSubCategory> = {};
	public submitted: boolean = false;
	public subSubmitted: boolean = false;

	// Expanded rows for subcategories
	public expandedCategories: Set<number> = new Set();

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

	ngAfterViewInit(): void {
		this.actionMenuList.changes.subscribe(() => {
			this.updateMenuReferences();
		});
		this.subActionMenuList.changes.subscribe(() => {
			this.updateSubMenuReferences();
		});
		setTimeout(() => {
			this.updateMenuReferences();
			this.updateSubMenuReferences();
		}, 0);
	}

	private updateMenuReferences(): void {
		if (this.actionMenuList && this.actionMenuList.length > 0) {
			const categories = this.getFilteredCategories();
			this.actionMenuList.forEach((menu: TieredMenu, index) => {
				if (categories[index]) {
					this.actionMenus.set(categories[index].id!, menu);
				}
			});
		}
	}

	private updateSubMenuReferences(): void {
		if (this.subActionMenuList && this.subActionMenuList.length > 0) {
			const subCategories = this.getFilteredSubCategories();
			this.subActionMenuList.forEach((menu: TieredMenu, index) => {
				if (subCategories[index]) {
					this.subActionMenus.set(subCategories[index].id!, menu);
				}
			});
		}
	}

	public loadCategories(): void {
		this.loading = true;
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				this.totalRecords = data.length;
				this.loading = false;
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
		return this.categories;
	}

	public getFilteredSubCategories(): ProductSubCategory[] {
		return this.subCategories;
	}

	public getSubCategoriesForCategory(categoryId: number): ProductSubCategory[] {
		return this.subCategories.filter((sub) => sub.productCategoryId === categoryId);
	}

	public toggleCategoryExpansion(categoryId: number): void {
		if (this.expandedCategories.has(categoryId)) {
			this.expandedCategories.delete(categoryId);
		} else {
			this.expandedCategories.add(categoryId);
		}
	}

	public isCategoryExpanded(categoryId: number): boolean {
		return this.expandedCategories.has(categoryId);
	}

	public onPageChange(event: any): void {
		this.first = event.first;
		this.rows = event.rows;
		this.totalRecords = this.categories.length;
	}

	public formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	public openNewCategory(): void {
		this.category = {
			isActive: true,
		};
		this.submitted = false;
		this.categoryDialog = true;
	}

	public editCategory(category: ProductCategory): void {
		this.category = { ...category };
		this.submitted = false;
		this.categoryDialog = true;
	}

	public deleteCategory(category: ProductCategory): void {
		this.categoryToDelete = category;
		this.deleteDialog = true;
	}

	public confirmDeleteCategory(): void {
		if (this.categoryToDelete) {
			this.loading = true;
			this.categoryService.deleteCategory(this.categoryToDelete.id!).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Category deleted successfully',
					});
					this.loadCategories();
					this.loadSubCategories();
					this.deleteDialog = false;
					this.categoryToDelete = null;
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete category',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	public saveCategory(): void {
		this.submitted = true;

		if (!this.category.name?.trim()) {
			return;
		}

		this.loading = true;

		if (this.category.id) {
			const updateData: UpdateProductCategoryDto = {
				name: this.category.name,
				description: this.category.description,
				isActive: this.category.isActive,
			};
			this.categoryService.updateCategory(this.category.id, updateData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Category updated successfully',
					});
					this.loadCategories();
					this.categoryDialog = false;
					this.category = {};
					this.submitted = false;
					this.loading = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to update category',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			const createData: CreateProductCategoryDto = {
				name: this.category.name!,
				description: this.category.description,
				isActive: this.category.isActive !== false,
			};
			this.categoryService.createCategory(createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Category created successfully',
					});
					this.loadCategories();
					this.categoryDialog = false;
					this.category = {};
					this.submitted = false;
					this.loading = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to create category',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	public openNewSubCategory(categoryId?: number): void {
		this.subCategory = {
			isActive: true,
		};
		if (categoryId) {
			this.subCategory.productCategoryId = categoryId;
		}
		this.subSubmitted = false;
		this.subCategoryDialog = true;
	}

	public editSubCategory(subCategory: ProductSubCategory): void {
		this.subCategory = { ...subCategory };
		this.subSubmitted = false;
		this.subCategoryDialog = true;
	}

	public deleteSubCategory(subCategory: ProductSubCategory): void {
		this.subCategoryToDelete = subCategory;
		this.deleteDialog = true;
	}

	public confirmDeleteSubCategory(): void {
		if (this.subCategoryToDelete) {
			this.loading = true;
			this.subCategoryService.deleteSubCategory(this.subCategoryToDelete.id!).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Sub category deleted successfully',
					});
					this.loadSubCategories();
					this.deleteDialog = false;
					this.subCategoryToDelete = null;
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete sub category',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	public saveSubCategory(): void {
		this.subSubmitted = true;

		if (!this.subCategory.name?.trim() || !this.subCategory.productCategoryId) {
			return;
		}

		this.loading = true;

		if (this.subCategory.id) {
			const updateData: UpdateProductSubCategoryDto = {
				name: this.subCategory.name,
				description: this.subCategory.description,
				productCategoryId: this.subCategory.productCategoryId,
				isActive: this.subCategory.isActive,
			};
			this.subCategoryService.updateSubCategory(this.subCategory.id, updateData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Sub category updated successfully',
					});
					this.loadSubCategories();
					this.subCategoryDialog = false;
					this.subCategory = {};
					this.subSubmitted = false;
					this.loading = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to update sub category',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			const createData: CreateProductSubCategoryDto = {
				name: this.subCategory.name!,
				description: this.subCategory.description,
				productCategoryId: this.subCategory.productCategoryId!,
				isActive: this.subCategory.isActive !== false,
			};
			this.subCategoryService.createSubCategory(createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Sub category created successfully',
					});
					this.loadSubCategories();
					this.subCategoryDialog = false;
					this.subCategory = {};
					this.subSubmitted = false;
					this.loading = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to create sub category',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	public getCategoryName(categoryId: number): string {
		const category = this.categories.find((c) => c.id === categoryId);
		return category?.name || 'N/A';
	}

	public toggleSelect(id: number): void {
		if (this.selected.includes(id)) {
			this.selected = this.selected.filter((i) => i !== id);
			this.selectedMap[id] = false;
		} else {
			this.selected.push(id);
			this.selectedMap[id] = true;
		}
		this.allSelected = this.isAllSelected();
		this.updateSelectedCategories();
	}

	public toggleAll(): void {
		const currentCategories = this.getFilteredCategories();
		const ids = currentCategories.map((c) => c.id!);
		if (this.allSelected) {
			this.selected = this.selected.filter((id) => !ids.includes(id));
			ids.forEach((id) => {
				this.selectedMap[id] = false;
			});
			this.allSelected = false;
		} else {
			this.selected = [...new Set([...this.selected, ...ids])];
			ids.forEach((id) => {
				this.selectedMap[id] = true;
			});
			this.allSelected = true;
		}
		this.updateSelectedCategories();
	}

	public isAllSelected(): boolean {
		const currentCategories = this.getFilteredCategories();
		const ids = currentCategories.map((c) => c.id!);
		return ids.length > 0 && ids.every((id) => this.selected.includes(id));
	}

	public isSelected(id: number): boolean {
		return this.selected.includes(id);
	}

	public updateSelectedCategories(): void {
		this.selectedCategories = this.categories.filter((c) => this.selected.includes(c.id!));
	}

	public setActionMenu(categoryId: number, menu: TieredMenu): void {
		this.actionMenus.set(categoryId, menu);
	}

	public toggleActionMenu(event: Event, categoryId: number): void {
		event.stopPropagation();
		const menuRef = this.actionMenus.get(categoryId);
		if (menuRef) {
			menuRef.toggle(event);
		}
	}

	public setSubActionMenu(subCategoryId: number, menu: TieredMenu): void {
		this.subActionMenus.set(subCategoryId, menu);
	}

	public toggleSubActionMenu(event: Event, subCategoryId: number): void {
		event.stopPropagation();
		const menuRef = this.subActionMenus.get(subCategoryId);
		if (menuRef) {
			menuRef.toggle(event);
		}
	}

	public getActionMenuItems(category: ProductCategory): any[] {
		return [
			{
				label: 'View Subcategories',
				icon: 'pi pi-list',
				command: () => {
					this.toggleCategoryExpansion(category.id!);
				},
			},
			{
				label: 'Add Subcategory',
				icon: 'pi pi-plus',
				command: () => {
					this.openNewSubCategory(category.id);
				},
			},
			{
				separator: true,
			},
			{
				label: 'Edit',
				icon: 'pi pi-pencil',
				command: () => {
					this.editCategory(category);
				},
			},
			{
				label: 'Delete',
				icon: 'pi pi-trash',
				command: () => {
					this.deleteCategory(category);
				},
			},
		];
	}

	public getSubActionMenuItems(subCategory: ProductSubCategory): any[] {
		return [
			{
				label: 'Edit',
				icon: 'pi pi-pencil',
				command: () => {
					this.editSubCategory(subCategory);
				},
			},
			{
				label: 'Delete',
				icon: 'pi pi-trash',
				command: () => {
					this.deleteSubCategory(subCategory);
				},
			},
		];
	}

	public getStatusClasses(isActive: boolean | undefined): string {
		if (isActive !== false) {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-green-50 text-green-700 dark:bg-green-500 dark:bg-opacity-15 dark:text-green-500';
		} else {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-red-50 text-red-700 dark:bg-red-500 dark:bg-opacity-15 dark:text-red-500';
		}
	}

	public onStatusFilterChange(event: any): void {
		this.statusFilter = event.value;
		if (this.categoryTable) {
			if (event.value !== null) {
				this.categoryTable.filter(event.value, 'isActive', 'equals');
			} else {
				this.categoryTable.filter(null, 'isActive', 'equals');
			}
		}
	}

	public clearFilters(): void {
		this.globalFilter = '';
		this.statusFilter = null;
		if (this.categoryTable) {
			this.categoryTable.clear();
			this.categoryTable.reset();
		}
	}
}

