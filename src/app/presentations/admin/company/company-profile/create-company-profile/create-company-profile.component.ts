import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { environment } from '../../../../../../environments/environment';
import { CreateCompanyDto, ZpssBankName, CompanyService } from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';


@Component({
	selector: 'app-create-company-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-company-profile.component.html',
	styleUrls: ['./create-company-profile.component.scss'],
})
export class CreateCompanyProfileComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	companyForm!: FormGroup;

	// Form Data
	company: Partial<CreateCompanyDto> = {
		name: '',
		phone1: '',
		phone2: '',
		phone3: '',
		email: '',
		address: '',
		dzongkhag: '',
		thromde: '',
		country: 'Bhutan',
		website: '',
		tpnNumber: '',
		businessLicenseNumber: '',
		slogan: '',
		facebookLink: '',
		tiktokLink: '',
		description: '',
		// logo field removed - handled separately via POST /company/logo
		isActive: true,
		zpssBankName: undefined,
		zpssAccountName: '',
		zpssAccountNumber: '',
	};

	// Dzongkhag options (Bhutan districts)
	dzongkhagOptions = [
		'Bumthang',
		'Chhukha',
		'Dagana',
		'Gasa',
		'Haa',
		'Lhuntse',
		'Mongar',
		'Paro',
		'Pemagatshel',
		'Punakha',
		'Samdrup Jongkhar',
		'Samtse',
		'Sarpang',
		'Thimphu',
		'Trashigang',
		'Trashiyangtse',
		'Trongsa',
		'Tsirang',
		'Wangdue Phodrang',
		'Zhemgang',
	];

	// Bank name options
	bankNameOptions = [
		{ label: 'BOB', value: ZpssBankName.BOB },
		{ label: 'BNB', value: ZpssBankName.BNB },
		{ label: 'PNB', value: ZpssBankName.PNB },
		{ label: 'BDBL', value: ZpssBankName.BDBL },
		{ label: 'TBANK', value: ZpssBankName.TBANK },
		{ label: 'DKBANK', value: ZpssBankName.DKBANK },
	];

	constructor(
		private companyService: CompanyService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {
		this.initForm();
	}

	initForm() {
		this.companyForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
			phone1: [''],
			phone2: [''],
			phone3: [''],
			email: ['', [this.emailValidator]],
			address: [''],
			dzongkhag: [''],
			thromde: [''],
			country: ['Bhutan'],
			website: ['', [this.urlValidator]],
			tpnNumber: [''],
			businessLicenseNumber: [''],
			slogan: ['', [Validators.maxLength(255)]],
			facebookLink: ['', [this.urlValidator]],
			tiktokLink: ['', [this.urlValidator]],
			description: [''],
			isActive: [true],
			zpssBankName: [null],
			zpssAccountName: [''],
			zpssAccountNumber: [''],
			// Note: logo field removed - logo upload is handled separately via POST /company/logo
		});
	}

	ngOnInit() {
		// Sync form values to company object for template (for backward compatibility with preview)
		this.companyForm.valueChanges.subscribe((value) => {
			this.company = { ...this.company, ...value };
		});
		// Initialize company object with form values
		this.company = { ...this.company, ...this.companyForm.value };
	}

	// Custom validators
	emailValidator(control: AbstractControl): ValidationErrors | null {
		if (!control.value) return null; // Optional field
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(control.value) ? null : { invalidEmail: true };
	}

	urlValidator(control: AbstractControl): ValidationErrors | null {
		if (!control.value) return null; // Optional field
		try {
			new URL(control.value);
			return null;
		} catch {
			// If it's a relative path, allow it
			if (control.value.startsWith('/') || control.value.startsWith('./')) {
				return null;
			}
			return { invalidUrl: true };
		}
	}

	/**
	 * Clean form data before sending to API
	 * According to API documentation:
	 * - URL fields (website, facebookLink, tiktokLink): Cannot be empty strings - omit if empty
	 * - Optional string fields: Omit if empty string
	 * - For CREATE: Only 'name' is required
	 */
	private cleanFormData(data: any): any {
		const cleaned: any = {};
		
		// URL fields - omit if empty string (API requirement: cannot send empty strings)
		const urlFields = ['website', 'facebookLink', 'tiktokLink'];
		// Optional string fields - omit if empty string
		// Note: logo is not included here - it's handled separately via POST /company/logo
		const optionalStringFields = ['phone1', 'phone2', 'phone3', 'email', 'address', 'dzongkhag', 'thromde', 'country', 'tpnNumber', 'businessLicenseNumber', 'slogan', 'description', 'zpssAccountName', 'zpssAccountNumber'];

		// Always include name if provided (required for CREATE)
		if (data.name && typeof data.name === 'string' && data.name.trim().length > 0) {
			cleaned.name = data.name.trim();
		}

		// Handle URL fields - omit if empty string (API requirement: cannot send empty strings)
		// These fields must be valid URLs or omitted entirely
		for (const field of urlFields) {
			if (data[field] && typeof data[field] === 'string') {
				const trimmed = data[field].trim();
				if (trimmed.length > 0) {
					cleaned[field] = trimmed;
				}
				// If empty string, omit the field entirely (don't include in cleaned object)
			}
		}

		// Handle optional string fields - omit if empty string
		// For CREATE: Omitting fields means "use default/null value"
		for (const field of optionalStringFields) {
			if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
				const value = String(data[field]).trim();
				if (value.length > 0) {
					cleaned[field] = value;
				}
				// If empty after trim, omit the field
			}
		}

		// Handle boolean fields - include if defined
		if (data.isActive !== undefined) {
			cleaned.isActive = Boolean(data.isActive);
		}

		// Handle enum fields - include if not null/undefined/empty
		// zpssBankName is an enum, include only if valid value
		if (data.zpssBankName !== null && data.zpssBankName !== undefined && data.zpssBankName !== '') {
			cleaned.zpssBankName = data.zpssBankName;
		}

		return cleaned;
	}

	createCompany() {
		this.submitted = true;

		// Validate required fields - name is required for CREATE
		if (!this.companyForm.get('name')?.value) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Company name is required',
			});
			this.companyForm.get('name')?.markAsTouched();
			return;
		}

		// Mark all fields as touched if form is invalid
		if (this.companyForm.invalid) {
			Object.keys(this.companyForm.controls).forEach((key) => {
				this.companyForm.get(key)?.markAsTouched();
			});
			const firstErrorField = Object.keys(this.companyForm.controls).find(
				(key) => this.companyForm.get(key)?.invalid
			);
			if (firstErrorField) {
				const errorMessage = this.getFieldError(firstErrorField);
				this.messageService.add({
					severity: 'warn',
					summary: 'Validation Error',
					detail: errorMessage || 'Please fill in all required fields correctly',
				});
			}
			return;
		}

		this.loading = true;
		const formValue = this.companyForm.value;
		const cleanedData = this.cleanFormData(formValue);

		// Ensure name is present for CREATE mode (required field per API)
		if (!cleanedData.name) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Company name is required',
			});
			this.loading = false;
			return;
		}

		// CREATE: POST /company
		// Only 'name' is required, all other fields are optional
		const createData: CreateCompanyDto = cleanedData;
		this.companyService.createCompany(createData).subscribe({
			next: (data) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Company profile created successfully',
				});
				this.loading = false;
				// Close dialog and pass the created company data
				this.ref.close(data);
			},
			error: (error) => {
				let errorMessage = 'Failed to create company profile';
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

	isFormValid(): boolean {
		return this.companyForm.valid;
	}

	getFieldError(fieldName: string): string {
		const control = this.companyForm.get(fieldName);
		if (control && control.errors && control.touched) {
			if (control.errors['required']) {
				return `${this.getFieldLabel(fieldName)} is required`;
			}
			if (control.errors['minlength']) {
				return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
			}
			if (control.errors['maxlength']) {
				return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
			}
			if (control.errors['invalidEmail']) {
				return 'Please enter a valid email address';
			}
			if (control.errors['invalidUrl']) {
				return 'Please enter a valid URL';
			}
		}
		return '';
	}

	getFieldLabel(fieldName: string): string {
		const labels: { [key: string]: string } = {
			name: 'Company Name',
			email: 'Email Address',
			website: 'Website',
			facebookLink: 'Facebook Link',
			tiktokLink: 'TikTok Link',
			// logo field removed - handled separately
			zpssBankName: 'Bank Name',
			zpssAccountName: 'Account Name',
			zpssAccountNumber: 'Account Number',
		};
		return labels[fieldName] || fieldName;
	}

	isFieldInvalid(fieldName: string): boolean {
		const control = this.companyForm.get(fieldName);
		return !!(control && control.invalid && (control.touched || this.submitted));
	}

	close() {
		this.ref.close();
	}

}

