import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PrimeNgModules } from '../../../primeng.modules';
import { DocumentCategoryService } from '../../../core/dataservice/documents/document-category/document-category.service';
import { DocumentSubCategoryService } from '../../../core/dataservice/documents/document-sub-category/document-sub-category.service';
import { DocumentService } from '../../../core/dataservice/documents/document/document.service';
import {
	Document,
	DocumentQueryDto,
} from '../../../core/dataservice/documents/document/document.interface';
import {
	DocumentCategory,
} from '../../../core/dataservice/documents/document-category/document-category.interface';
import {
	DocumentSubCategory,
} from '../../../core/dataservice/documents/document-sub-category/document-sub-category.interface';
import { DocumentPreviewComponent } from './document-preview/document-preview.component';

@Component({
	selector: 'app-staff-document-archive',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		PrimeNgModules,
	],
	providers: [MessageService, DialogService],
	templateUrl: './staff-document-archive.component.html',
	styleUrls: ['./staff-document-archive.component.scss'],
})
export class StaffDocumentArchiveComponent implements OnInit {
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

	// Tree structure for sidebar
	public expandedCategories: Set<number> = new Set();
	public viewMode: 'grid' | 'list' = 'grid';
	public breadcrumbPath: Array<{ type: 'category' | 'subcategory'; item: DocumentCategory | DocumentSubCategory }> = [];
	private dialogRef: DynamicDialogRef | undefined;

	constructor(
		private categoryService: DocumentCategoryService,
		private subCategoryService: DocumentSubCategoryService,
		private documentService: DocumentService,
		private messageService: MessageService,
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

	public previewDocument(document: Document): void {
		this.dialogRef = this.dialogService.open(DocumentPreviewComponent, {
			header: 'Document Preview',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				document: document,
			},
		});

		this.dialogRef.onClose.subscribe(() => {
			// Dialog closed
		});
	}
}
