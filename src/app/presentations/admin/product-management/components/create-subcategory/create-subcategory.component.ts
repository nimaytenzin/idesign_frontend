import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductSubCategoryService } from '../../../../../core/dataservice/product-sub-category/product-sub-category.service';
import {
	ProductCategory,
	ProductSubCategory,
	CreateProductSubCategoryDto,
} from '../../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-create-subcategory',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-subcategory.component.html',
	styleUrls: ['./create-subcategory.component.scss'],
})
export class CreateSubcategoryComponent implements OnInit {
	@Input() parentCategoryId?: number | null;
	@Input() categories: ProductCategory[] = [];
	@Output() subcategoryCreated = new EventEmitter<ProductSubCategory>();

	loading: boolean = false;
	submitted: boolean = false;
	subcategoryForm!: FormGroup;
	categoriesList: ProductCategory[] = [];

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

		// Pre-select category if provided
		const categoryId = this.parentCategoryId || this.config?.data?.categoryId;
		if (categoryId) {
			this.subcategoryForm.patchValue({
				productCategoryId: categoryId,
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

		const createData: CreateProductSubCategoryDto = {
			name: formValue.name,
			description: formValue.description || undefined,
			productCategoryId: formValue.productCategoryId,
			isActive: formValue.isActive === true,
		};

		this.subCategoryService.createSubCategory(createData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Subcategory created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.subcategoryCreated.emit(data);
					// Reset form
					this.subcategoryForm.reset();
					this.subcategoryForm.patchValue({ isActive: true });
					if (this.parentCategoryId) {
						this.subcategoryForm.patchValue({ productCategoryId: this.parentCategoryId });
					}
					this.submitted = false;
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create subcategory';
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

