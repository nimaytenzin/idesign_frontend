import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Document, DocumentSubCategory, DocumentService, UpdateDocumentDto } from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-update-document',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-document.component.html',
	styleUrls: ['./update-document.component.scss'],
})
export class UpdateDocumentComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	documentForm!: FormGroup;
	document!: Document;
	subCategories: DocumentSubCategory[] = [];

	constructor(
		private documentService: DocumentService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig,
	) {
		this.initForm();
	}

	initForm() {
		this.documentForm = this.fb.group({
			documentTitle: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
		});
	}

	ngOnInit() {
		if (this.config?.data) {
			if (this.config.data.document) {
				this.document = this.config.data.document;
				this.documentForm.patchValue({
					documentTitle: this.document.documentTitle,
				});
			}
			if (this.config.data.subCategories) {
				this.subCategories = this.config.data.subCategories;
			}
		}
	}

	saveDocument() {
		this.submitted = true;

		if (this.documentForm.invalid || !this.document) {
			Object.keys(this.documentForm.controls).forEach((key) => {
				this.documentForm.get(key)?.markAsTouched();
			});
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields correctly',
			});
			return;
		}

		this.loading = true;
		const formValue = this.documentForm.value;

		const updateData: UpdateDocumentDto = {
			documentTitle: formValue.documentTitle.trim(),
		};

		this.documentService.updateDocument(this.document.documentId, updateData).subscribe({
			next: (data: Document) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Document updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update document';
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
		const control = this.documentForm.get(fieldName);
		return !!(control && control.invalid && (control.touched || this.submitted));
	}

	getFieldError(fieldName: string): string {
		const control = this.documentForm.get(fieldName);
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
