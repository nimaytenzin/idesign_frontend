import { Component, OnInit, ChangeDetectorRef, Optional, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DocumentSubCategory, DocumentService, CreateDocumentDto, AuthService } from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-create-document',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-document.component.html',
	styleUrls: ['./create-document.component.scss'],
})
export class CreateDocumentComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	documentForm!: FormGroup;
	subCategories: DocumentSubCategory[] = [];
	selectedFile: File | null = null;
	selectedSubCategoryId: number | null = null;
	fileError: string | null = null;
	@ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

	constructor(
		private documentService: DocumentService,
		private authService: AuthService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig,
	) {
		// Get subCategories and subCategoryId from config if provided
		if (this.config?.data) {
			if (this.config.data.subCategories) {
				this.subCategories = this.config.data.subCategories;
			}
			if (this.config.data.subCategoryId) {
				this.selectedSubCategoryId = this.config.data.subCategoryId;
			}
		}
		this.initForm();
	}

	initForm() {
		this.documentForm = this.fb.group({
			subCategoryId: [this.selectedSubCategoryId || null, [Validators.required]],
			documentTitle: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
			file: [null, [Validators.required]],
			versionNumber: [1, [Validators.required, Validators.min(1)]],
		});
	}

	ngOnInit() {
	}

	onFileChange(event: Event): void {
		this.fileError = null;
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const file = input.files[0];
			// Check file size (10MB = 10 * 1024 * 1024 bytes)
			const maxSize = 10 * 1024 * 1024;
			if (file.size > maxSize) {
				this.fileError = `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`;
				this.selectedFile = null;
				this.documentForm.patchValue({ file: null });
				input.value = ''; // Clear the input
				this.cdr.markForCheck();
				return;
			}
			this.selectedFile = file;
			this.documentForm.patchValue({ file: file });
			this.cdr.markForCheck();
		}
	}

	onFileRemove(): void {
		this.selectedFile = null;
		this.fileError = null;
		this.documentForm.patchValue({ file: null });
		if (this.fileInputRef?.nativeElement) {
			this.fileInputRef.nativeElement.value = '';
		}
	}

	saveDocument() {
		this.submitted = true;

		if (this.documentForm.invalid || !this.selectedFile) {
			if (!this.selectedFile) {
				this.messageService.add({
					severity: 'warn',
					summary: 'Validation Error',
					detail: 'Please select a file',
				});
			} else {
				Object.keys(this.documentForm.controls).forEach((key) => {
					this.documentForm.get(key)?.markAsTouched();
				});
				this.messageService.add({
					severity: 'warn',
					summary: 'Validation Error',
					detail: 'Please fill in all required fields correctly',
				});
			}
			return;
		}

		const currentUser = this.authService.getCurrentUser();
		if (!currentUser || !currentUser.id) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'User not authenticated',
			});
			return;
		}

		this.loading = true;
		const formValue = this.documentForm.value;

		const createData: CreateDocumentDto = {
			file: this.selectedFile!,
			subCategoryId: formValue.subCategoryId,
			userId: currentUser.id,
			documentTitle: formValue.documentTitle,
			versionNumber: formValue.versionNumber || 1,
		};

		this.documentService.createDocument(createData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Document created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.documentForm.reset();
					this.selectedFile = null;
					this.submitted = false;
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create document';
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
			if (control.errors['min']) {
				return `${fieldName} must be at least ${control.errors['min'].min}`;
			}
		}
		return '';
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
