import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ContextMenu } from 'primeng/contextmenu';
import { DocumentService } from '../../../../core/dataservice/documents/document/document.service';
import { DocumentCategoryService } from '../../../../core/dataservice/documents/document-category/document-category.service';
import { DocumentSubCategoryService } from '../../../../core/dataservice/documents/document-sub-category/document-sub-category.service';
import {
	Document,
	DocumentQueryDto,
} from '../../../../core/dataservice/documents/document/document.interface';
import {
	DocumentCategory,
} from '../../../../core/dataservice/documents/document-category/document-category.interface';
import {
	DocumentSubCategory,
} from '../../../../core/dataservice/documents/document-sub-category/document-sub-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { CreateDocumentCategoryComponent } from '../components/create-document-category/create-document-category.component';
import { UpdateDocumentCategoryComponent } from '../components/update-document-category/update-document-category.component';
import { CreateDocumentSubCategoryComponent } from '../components/create-document-sub-category/create-document-sub-category.component';
import { UpdateDocumentSubCategoryComponent } from '../components/update-document-sub-category/update-document-sub-category.component';
import { CreateDocumentComponent } from '../components/create-document/create-document.component';
import { UpdateDocumentComponent } from '../components/update-document/update-document.component';

@Component({
	selector: 'app-admin-list-documents',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		PrimeNgModules,
	],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-list-documents.component.html',
	styleUrls: ['./admin-list-documents.component.scss'],
})
export class AdminListDocumentsComponent implements OnInit {
	// Data
	public categories: DocumentCategory[] = [];
	public subCategories: DocumentSubCategory[] = [];
	public documents: Document[] = [];

	// Filters
	public searchFilter: string = '';
	public selectedSubCategoryId: number | null = null;

	// UI State
	public loading: boolean = false;

	// Selection state
	public selectedCategoryId: number | null = null;
	public selectedCategory: DocumentCategory | null = null;
	public selectedSubCategory: DocumentSubCategory | null = null;
	public dialogRef?: DynamicDialogRef;

	// Tree structure for sidebar
	public expandedCategories: Set<number> = new Set();
	public viewMode: 'grid' | 'list' = 'grid';
	public breadcrumbPath: Array<{ type: 'category' | 'subcategory'; item: DocumentCategory | DocumentSubCategory }> = [];
	public categoryContextMenuItems: MenuItem[] = [];
	public selectedCategoryForContext: DocumentCategory | null = null;
	@ViewChild('categoryContextMenu') categoryContextMenu!: ContextMenu;

	constructor(
		private categoryService: DocumentCategoryService,
		private subCategoryService: DocumentSubCategoryService,
		private documentService: DocumentService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadCategories();
		this.loadSubCategories();
		this.loadDocuments();
		// Auto-expand first category if available
		if (this.categories.length > 0) {
			setTimeout(() => {
				if (this.categories.length > 0) {
					this.expandedCategories.add(this.categories[0].categoryId);
					this.selectCategory(this.categories[0]);
				}
			}, 100);
		}
	}

	public loadCategories(): void {
		this.loading = true;
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				this.loading = false;
				// Auto-select and expand the first category if available and none is selected
				if (data.length > 0 && !this.selectedCategory) {
					this.expandedCategories.add(data[0].categoryId);
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

	public loadDocuments(query?: DocumentQueryDto): void {
		this.loading = true;
		this.documentService.getDocuments(query).subscribe({
			next: (data) => {
				this.documents = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load documents',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	public getFilteredCategories(): DocumentCategory[] {
		if (!this.searchFilter) {
			return this.categories;
		}
		const filter = this.searchFilter.toLowerCase();
		return this.categories.filter(
			(cat) =>
				cat.categoryName.toLowerCase().includes(filter) ||
				(cat.description && cat.description.toLowerCase().includes(filter))
		);
	}

	public getSubCategoriesForCategory(categoryId: number): DocumentSubCategory[] {
		return this.subCategories.filter((sub) => sub.categoryId === categoryId);
	}

	public getDocumentsForSubCategory(subCategoryId: number): Document[] {
		return this.documents.filter((doc) => doc.subCategoryId === subCategoryId);
	}

	// Tree methods
	public toggleCategory(category: DocumentCategory, event?: Event): void {
		if (event) {
			event.stopPropagation();
		}
		if (this.expandedCategories.has(category.categoryId)) {
			this.expandedCategories.delete(category.categoryId);
		} else {
			this.expandedCategories.add(category.categoryId);
		}
		this.selectCategory(category);
	}

	public isCategoryExpanded(categoryId: number): boolean {
		return this.expandedCategories.has(categoryId);
	}

	// Selection methods
	public selectCategory(category: DocumentCategory): void {
		this.selectedCategoryId = category.categoryId;
		this.selectedCategory = category;
		this.selectedSubCategory = null;
		this.selectedSubCategoryId = null;
		this.updateBreadcrumb();
		this.loadDocuments();
	}

	public selectSubCategory(subCategory: DocumentSubCategory): void {
		this.selectedSubCategory = subCategory;
		this.selectedSubCategoryId = subCategory.subCategoryId;
		this.updateBreadcrumb();
		this.loadDocuments({ subCategoryId: subCategory.subCategoryId });
	}

	public updateBreadcrumb(): void {
		this.breadcrumbPath = [];
		if (this.selectedCategory) {
			this.breadcrumbPath.push({ type: 'category', item: this.selectedCategory });
		}
		if (this.selectedSubCategory) {
			this.breadcrumbPath.push({ type: 'subcategory', item: this.selectedSubCategory });
		}
	}

	public navigateBreadcrumb(item: DocumentCategory | DocumentSubCategory, type: 'category' | 'subcategory'): void {
		if (type === 'category') {
			const category = item as DocumentCategory;
			this.selectCategory(category);
			this.expandedCategories.add(category.categoryId);
		} else {
			const subCategory = item as DocumentSubCategory;
			const category = this.categories.find(c => c.categoryId === subCategory.categoryId);
			if (category) {
				this.expandedCategories.add(category.categoryId);
				this.selectCategory(category);
				setTimeout(() => {
					this.selectSubCategory(subCategory);
				}, 50);
			}
		}
	}

	public toggleViewMode(): void {
		this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
	}

	public getCurrentDocuments(): Document[] {
		if (this.selectedSubCategoryId) {
			return this.getDocumentsForSubCategory(this.selectedSubCategoryId);
		} else if (this.selectedCategoryId) {
			// Return all documents from all subcategories in the selected category
			const subCatIds = this.getSubCategoriesForCategory(this.selectedCategoryId).map(s => s.subCategoryId);
			return this.documents.filter(doc => subCatIds.includes(doc.subCategoryId));
		}
		return [];
	}

	public getFileIcon(fileType: string): string {
		if (!fileType) return 'pi-file';
		const type = fileType.toLowerCase();
		if (type.includes('pdf')) return 'pi-file-pdf';
		if (type.includes('word') || type.includes('doc')) return 'pi-file-word';
		if (type.includes('excel') || type.includes('sheet')) return 'pi-file-excel';
		if (type.includes('image')) return 'pi-image';
		if (type.includes('zip') || type.includes('rar')) return 'pi-file-archive';
		return 'pi-file';
	}

	// Category Dialog methods
	public openNewCategory(): void {
		this.dialogRef = this.dialogService.open(CreateDocumentCategoryComponent, {
			header: 'New Document Category',
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
				if (result.categoryId) {
					const newCategory = this.categories.find(c => c.categoryId === result.categoryId);
					if (newCategory) {
						this.selectCategory(newCategory);
					}
				}
			}
		});
	}

	public editCategory(category: DocumentCategory): void {
		this.dialogRef = this.dialogService.open(UpdateDocumentCategoryComponent, {
			header: 'Edit Document Category',
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
				if (this.selectedCategory && result.categoryId === this.selectedCategory.categoryId) {
					const updatedCategory = this.categories.find(c => c.categoryId === result.categoryId);
					if (updatedCategory) {
						this.selectCategory(updatedCategory);
					}
				}
			}
		});
	}

	public deleteCategory(category: DocumentCategory): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${category.categoryName}"? This action cannot be undone.`,
			header: 'Delete Category',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.categoryService.deleteCategory(category.categoryId).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Category deleted successfully',
						});
						this.loadCategories();
						this.loadSubCategories();
						if (this.selectedCategoryId === category.categoryId) {
							this.selectedCategoryId = null;
							this.selectedCategory = null;
							this.selectedSubCategory = null;
							this.selectedSubCategoryId = null;
						}
						this.loadDocuments();
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

	// Sub-Category Dialog methods
	public openNewSubCategory(categoryId: number): void {
		this.dialogRef = this.dialogService.open(CreateDocumentSubCategoryComponent, {
			header: 'New Document Sub-Category',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				categoryId: categoryId,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadSubCategories();
			}
		});
	}

	public editSubCategory(subCategory: DocumentSubCategory): void {
		this.dialogRef = this.dialogService.open(UpdateDocumentSubCategoryComponent, {
			header: 'Edit Document Sub-Category',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				subCategory: subCategory,
				categories: this.categories,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadSubCategories();
			}
		});
	}

	public deleteSubCategory(subCategory: DocumentSubCategory): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${subCategory.subCategoryName}"? This will also delete all documents in this sub-category.`,
			header: 'Delete Sub-Category',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.subCategoryService.deleteSubCategory(subCategory.subCategoryId).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Sub-category deleted successfully',
						});
						this.loadSubCategories();
						if (this.selectedSubCategoryId === subCategory.subCategoryId) {
							this.selectedSubCategory = null;
							this.selectedSubCategoryId = null;
						}
						this.loadDocuments();
						this.loading = false;
					},
					error: (error) => {
						let errorMessage = 'Failed to delete sub-category';
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

	// Document Dialog methods
	public openNewDocument(subCategoryId: number): void {
		this.dialogRef = this.dialogService.open(CreateDocumentComponent, {
			header: 'New Document',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				subCategories: this.subCategories,
				subCategoryId: subCategoryId,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadDocuments(this.selectedSubCategoryId ? { subCategoryId: this.selectedSubCategoryId } : undefined);
			}
		});
	}

	public editDocument(document: Document): void {
		this.dialogRef = this.dialogService.open(UpdateDocumentComponent, {
			header: 'Edit Document',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				document: document,
				subCategories: this.subCategories,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadDocuments(this.selectedSubCategoryId ? { subCategoryId: this.selectedSubCategoryId } : undefined);
			}
		});
	}

	public deleteDocument(document: Document): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${document.documentTitle}"? This action cannot be undone.`,
			header: 'Delete Document',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.documentService.deleteDocument(document.documentId).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Document deleted successfully',
						});
						this.loadDocuments(this.selectedSubCategoryId ? { subCategoryId: this.selectedSubCategoryId } : undefined);
						this.loading = false;
					},
					error: (error) => {
						let errorMessage = 'Failed to delete document';
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

	public downloadDocument(doc: Document): void {
		this.loading = true;
		this.documentService.downloadDocument(doc.documentId).subscribe({
			next: (blob) => {
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = doc.fileName;
				link.click();
				window.URL.revokeObjectURL(url);
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Document downloaded successfully',
				});
				this.loading = false;
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to download document',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	public formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}

	public getCategoryName(item: DocumentCategory | DocumentSubCategory): string {
		return (item as DocumentCategory).categoryName || '';
	}

	public getSubCategoryName(item: DocumentCategory | DocumentSubCategory): string {
		return (item as DocumentSubCategory).subCategoryName || '';
	}

	public getCategoryContextMenu(category: DocumentCategory): MenuItem[] {
		return [
			{
				label: 'Create Sub-Category',
				icon: 'pi pi-plus',
				command: () => {
					if (this.selectedCategoryForContext) {
						this.openNewSubCategory(this.selectedCategoryForContext.categoryId);
					}
				},
			},
			{
				separator: true,
			},
			{
				label: 'Edit Category',
				icon: 'pi pi-pencil',
				command: () => {
					if (this.selectedCategoryForContext) {
						this.editCategory(this.selectedCategoryForContext);
					}
				},
			},
			{
				label: 'Delete Category',
				icon: 'pi pi-trash',
				command: () => {
					if (this.selectedCategoryForContext) {
						this.deleteCategory(this.selectedCategoryForContext);
					}
				},
			},
		];
	}

	public onCategoryContextMenu(event: MouseEvent, category: DocumentCategory): void {
		event.preventDefault();
		event.stopPropagation();
		this.selectedCategoryForContext = category;
		this.categoryContextMenuItems = this.getCategoryContextMenu(category);
		this.categoryContextMenu.show(event);
	}
}
