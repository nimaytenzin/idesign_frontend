import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DocumentSubCategory, DocumentCategory, DocumentSubCategoryService, DocumentCategoryService, CreateDocumentSubCategoryDto } from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-create-document-sub-category',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-document-sub-category.component.html',
	styleUrls: ['./create-document-sub-category.component.scss'],
})
export class CreateDocumentSubCategoryComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	subCategoryForm!: FormGroup;
	categories: DocumentCategory[] = [];
	selectedCategoryId: number | null = null;
	loadingCategories: boolean = false;

	constructor(
		private subCategoryService: DocumentSubCategoryService,
		private categoryService: DocumentCategoryService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {
		if (config?.data?.categoryId) {
			this.selectedCategoryId = config.data.categoryId;
		}
		this.initForm();
	}

	initForm() {
		this.subCategoryForm = this.fb.group({
			categoryId: [this.selectedCategoryId || null, [Validators.required]],
			subCategoryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
		});
	}

	ngOnInit() {
		this.loadCategories();
	}

	loadCategories(): void {
		this.loadingCategories = true;
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				this.loadingCategories = false;
				// If a categoryId was passed, set it in the form
				if (this.selectedCategoryId) {
					this.subCategoryForm.patchValue({ categoryId: this.selectedCategoryId });
				}
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load categories',
				});
				this.loadingCategories = false;
				this.cdr.markForCheck();
			},
		});
	}

	saveSubCategory() {
		this.submitted = true;

		if (this.subCategoryForm.invalid) {
			Object.keys(this.subCategoryForm.controls).forEach((key) => {
				this.subCategoryForm.get(key)?.markAsTouched();
			});
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields correctly',
			});
			return;
		}

		this.loading = true;
		const formValue = this.subCategoryForm.value;

		const createData: CreateDocumentSubCategoryDto = {
			categoryId: formValue.categoryId,
			subCategoryName: formValue.subCategoryName,
		};

		this.subCategoryService.createSubCategory(createData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Sub-category created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.subCategoryForm.reset();
					this.submitted = false;
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create sub-category';
				if (error.error?.message) {
					if (Array.isArray(error.error.message)) {
						errorMessage = error.error.message.join(', ');
					} else if (typeof error.error.message === 'string') {
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
	}

	isFieldInvalid(fieldName: string): boolean {
		const control = this.subCategoryForm.get(fieldName);
		return !!(control && control.invalid && (control.touched || this.submitted));
	}

	getFieldError(fieldName: string): string {
		const control = this.subCategoryForm.get(fieldName);
		if (control && control.errors && control.touched) {
			if (control.errors['required']) {
				return `${fieldName} is required`;
			}
			if (control.errors['minlength']) {
				return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
			}
			if (control.errors['maxlength']) {
				return `${fieldName} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
			}
		}
		return '';
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
