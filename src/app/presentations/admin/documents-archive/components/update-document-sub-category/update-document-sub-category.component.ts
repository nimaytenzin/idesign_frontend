import { Component, OnInit, ChangeDetectorRef, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DocumentSubCategory, DocumentCategory, DocumentSubCategoryService, UpdateDocumentSubCategoryDto } from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';


@Component({
	selector: 'app-update-document-sub-category',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-document-sub-category.component.html',
	styleUrls: ['./update-document-sub-category.component.scss'],
})
export class UpdateDocumentSubCategoryComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	subCategoryForm!: FormGroup;
	subCategory!: DocumentSubCategory;
	categories: DocumentCategory[] = [];

	constructor(
		private subCategoryService: DocumentSubCategoryService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
	) {
		this.initForm();
	}

	initForm() {
		this.subCategoryForm = this.fb.group({
			categoryId: [this.subCategory?.categoryId || null, [Validators.required]],
			subCategoryName: [
				this.subCategory?.subCategoryName || '',
				[Validators.required, Validators.minLength(2), Validators.maxLength(255)]
			],
		});
	}

	ngOnInit() {
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

		const updateData: UpdateDocumentSubCategoryDto = {
			categoryId: formValue.categoryId,
			subCategoryName: formValue.subCategoryName,
		};

		this.subCategoryService.updateSubCategory(this.subCategory.subCategoryId, updateData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Sub-category updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.submitted = false;
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update sub-category';
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
