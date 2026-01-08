import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductSubCategoryService } from '../../../../../core/dataservice/product-sub-category/product-sub-category.service';
import type {
	ProductSubCategory,
	ProductCategory,
	UpdateProductSubCategoryDto,
} from '../../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-update-subcategory',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-subcategory.component.html',
	styleUrls: ['./update-subcategory.component.scss'],
})
export class UpdateSubcategoryComponent implements OnInit {
	@Input() subcategory?: ProductSubCategory;
	@Input() categories: ProductCategory[] = [];
	@Output() subcategoryUpdated = new EventEmitter<ProductSubCategory>();

	loading: boolean = false;
	submitted: boolean = false;
	subcategoryForm!: FormGroup;
	categoriesList: ProductCategory[] = [];
	subcategoryData!: ProductSubCategory;

	constructor(
		private subCategoryService: ProductSubCategoryService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {
		this.initForm();
	}

	initForm() {
		this.subcategoryForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
			description: [''],
			productCategoryId: [null, [Validators.required]],
			isActive: [true],
		});
	}

	ngOnInit() {
		// Get categories from @Input or config
		if (this.categories.length > 0) {
			this.categoriesList = this.categories;
		} else if (this.config?.data?.categories) {
			this.categoriesList = this.config.data.categories;
		}

		// Get subcategory from @Input or config
		if (this.subcategory) {
			this.subcategoryData = this.subcategory;
		} else if (this.config?.data?.subcategory) {
			this.subcategoryData = this.config.data.subcategory;
		}

		if (this.subcategoryData) {
			this.subcategoryForm.patchValue({
				name: this.subcategoryData.name || '',
				description: this.subcategoryData.description || '',
				productCategoryId: this.subcategoryData.productCategoryId || null,
				isActive: this.subcategoryData.isActive !== undefined ? this.subcategoryData.isActive : true,
			});
		}
	}

	saveSubCategory() {
		this.submitted = true;

		if (this.subcategoryForm.invalid) {
			Object.keys(this.subcategoryForm.controls).forEach((key) => {
				this.subcategoryForm.get(key)?.markAsTouched();
			});
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields correctly',
			});
			return;
		}

		this.loading = true;
		const formValue = this.subcategoryForm.value;

		const updateData: UpdateProductSubCategoryDto = {
			name: formValue.name,
			description: formValue.description || undefined,
			productCategoryId: formValue.productCategoryId,
			isActive: formValue.isActive,
		};

		this.subCategoryService.updateSubCategory(this.subcategoryData.id!, updateData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Subcategory updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.subcategoryUpdated.emit(data);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update subcategory';
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
		const control = this.subcategoryForm.get(fieldName);
		return !!(control && control.invalid && (control.touched || this.submitted));
	}

	getFieldError(fieldName: string): string {
		const control = this.subcategoryForm.get(fieldName);
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

