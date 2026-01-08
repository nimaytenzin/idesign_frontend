import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { environment } from '../../../../../../environments/environment';
import { UpdateCompanyDto, ZpssBankName, CompanyService, Company } from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-update-company-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-company-profile.component.html',
	styleUrls: ['./update-company-profile.component.scss'],
})
export class UpdateCompanyProfileComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	companyForm!: FormGroup;
	company: Company | null = null;

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
			name: ['', [Validators.minLength(2), Validators.maxLength(255)]],
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
		});
	}

	ngOnInit() {
		// Get company data from config (passed from parent component)
		if (this.config.data?.company) {
			this.company = this.config.data.company;
			const companyData = this.company;
			
			if (!companyData) {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Company data is required to update profile',
				});
				setTimeout(() => {
					this.close();
				}, 2000);
				return;
			}
			
			// Patch form with existing company data
			this.companyForm.patchValue({
				name: companyData.name || '',
				phone1: companyData.phone1 ?? '',
				phone2: companyData.phone2 ?? '',
				phone3: companyData.phone3 ?? '',
				email: companyData.email ?? '',
				address: companyData.address ?? '',
				dzongkhag: companyData.dzongkhag ?? '',
				thromde: companyData.thromde ?? '',
				country: companyData.country ?? 'Bhutan',
				website: companyData.website ?? '',
				tpnNumber: companyData.tpnNumber ?? '',
				businessLicenseNumber: companyData.businessLicenseNumber ?? '',
				slogan: companyData.slogan ?? '',
				facebookLink: companyData.facebookLink ?? '',
				tiktokLink: companyData.tiktokLink ?? '',
				description: companyData.description ?? '',
				isActive: companyData.isActive !== undefined ? companyData.isActive : true,
				zpssBankName: companyData.zpssBankName ?? null,
				zpssAccountName: companyData.zpssAccountName ?? '',
				zpssAccountNumber: companyData.zpssAccountNumber ?? '',
			});
		} else {
			// If no company data provided, show error and close
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Company data is required to update profile',
			});
			setTimeout(() => {
				this.close();
			}, 2000);
		}
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
	 * For UPDATE: All fields are optional (partial update)
	 * URL fields cannot be empty strings - omit if empty
	 */
	private cleanFormData(data: any): any {
		const cleaned: any = {};
		
		// URL fields - omit if empty string (API requirement: cannot send empty strings)
		const urlFields = ['website', 'facebookLink', 'tiktokLink'];
		// Optional string fields - omit if empty string
		const optionalStringFields = ['name', 'phone1', 'phone2', 'phone3', 'email', 'address', 'dzongkhag', 'thromde', 'country', 'tpnNumber', 'businessLicenseNumber', 'slogan', 'description', 'zpssAccountName', 'zpssAccountNumber'];

		// Handle name field
		if (data.name && typeof data.name === 'string' && data.name.trim().length > 0) {
			cleaned.name = data.name.trim();
		}

		// Handle URL fields - omit if empty string
		for (const field of urlFields) {
			if (data[field] && typeof data[field] === 'string') {
				const trimmed = data[field].trim();
				if (trimmed.length > 0) {
					cleaned[field] = trimmed;
				}
			}
		}

		// Handle optional string fields - omit if empty string
		for (const field of optionalStringFields) {
			if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
				const value = String(data[field]).trim();
				if (value.length > 0) {
					cleaned[field] = value;
				}
			}
		}

		// Handle boolean fields
		if (data.isActive !== undefined) {
			cleaned.isActive = Boolean(data.isActive);
		}

		// Handle enum fields
		if (data.zpssBankName !== null && data.zpssBankName !== undefined && data.zpssBankName !== '') {
			cleaned.zpssBankName = data.zpssBankName;
		}

		return cleaned;
	}

	updateCompany() {
		this.submitted = true;

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
					detail: errorMessage || 'Please fill in all fields correctly',
				});
			}
			return;
		}

		this.loading = true;
		const formValue = this.companyForm.value;
		const cleanedData = this.cleanFormData(formValue);

		// UPDATE: PATCH /company
		// All fields are optional - send only the fields that were changed
		const updateData: UpdateCompanyDto = cleanedData;
		this.companyService.updateCompany(updateData).subscribe({
			next: (data) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Company profile updated successfully',
				});
				this.loading = false;
				// Close dialog and pass the updated company data
				this.ref.close(data);
			},
			error: (error) => {
				let errorMessage = 'Failed to update company profile';
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

