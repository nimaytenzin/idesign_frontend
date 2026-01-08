import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductCategoryService } from '../../../../../core/dataservice/product-category/product-category.service';
import {
	ProductCategory,
	CreateProductCategoryDto,
} from '../../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-create-category',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-category.component.html',
	styleUrls: ['./create-category.component.scss'],
})
export class CreateCategoryComponent implements OnInit {
	@Output() categoryCreated = new EventEmitter<ProductCategory>();

	loading: boolean = false;
	submitted: boolean = false;
	categoryForm!: FormGroup;

	constructor(
		private categoryService: ProductCategoryService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef
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

		const createData: CreateProductCategoryDto = {
			name: formValue.name,
			description: formValue.description || undefined,
			isActive: formValue.isActive === true,
		};

		this.categoryService.createCategory(createData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Category created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.categoryCreated.emit(data);
					// Reset form
					this.categoryForm.reset();
					this.categoryForm.patchValue({ isActive: true });
					this.submitted = false;
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create category';
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

