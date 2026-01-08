import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductCategoryService } from '../../../../../core/dataservice/product-category/product-category.service';
import type {
	ProductCategory,
	UpdateProductCategoryDto,
} from '../../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-update-category',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-category.component.html',
	styleUrls: ['./update-category.component.scss'],
})
export class UpdateCategoryComponent implements OnInit {
	@Input() category?: ProductCategory;
	@Output() categoryUpdated = new EventEmitter<ProductCategory>();

	loading: boolean = false;
	submitted: boolean = false;
	categoryForm!: FormGroup;
	categoryData!: ProductCategory;

	constructor(
		private categoryService: ProductCategoryService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {
		this.initForm();
	}

	initForm() {
		this.categoryForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
			description: [''],
			isActive: [true],
		});
	}

	ngOnInit() {
		// Get category from @Input or config
		if (this.category) {
			this.categoryData = this.category;
		} else if (this.config?.data?.category) {
			this.categoryData = this.config.data.category;
		}

		if (this.categoryData) {
			this.categoryForm.patchValue({
				name: this.categoryData.name || '',
				description: this.categoryData.description || '',
				isActive: this.categoryData.isActive !== undefined ? this.categoryData.isActive : true,
			});
		}
	}

	saveCategory() {
		this.submitted = true;

		if (this.categoryForm.invalid) {
			Object.keys(this.categoryForm.controls).forEach((key) => {
				this.categoryForm.get(key)?.markAsTouched();
			});
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields correctly',
			});
			return;
		}

		this.loading = true;
		const formValue = this.categoryForm.value;

		const updateData: UpdateProductCategoryDto = {
			name: formValue.name,
			description: formValue.description || undefined,
			isActive: formValue.isActive,
		};

		this.categoryService.updateCategory(this.categoryData.id!, updateData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Category updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.categoryUpdated.emit(data);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update category';
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
		const control = this.categoryForm.get(fieldName);
		return !!(control && control.invalid && (control.touched || this.submitted));
	}

	getFieldError(fieldName: string): string {
		const control = this.categoryForm.get(fieldName);
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

