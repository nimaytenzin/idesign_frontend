import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from '../../../../../environments/environment';
import { Company, CompanyService } from '../../../../core/dataservice';
import { PrimeNgModules } from '../../../../primeng.modules';
import { CreateCompanyProfileComponent } from './create-company-profile/create-company-profile.component';
import { UpdateCompanyProfileComponent } from './update-company-profile/update-company-profile.component';


@Component({
	selector: 'app-company-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, DialogService, ConfirmationService],
	templateUrl: './company-profile.component.html',
	styleUrls: ['./company-profile.component.scss'],
})
export class CompanyProfileComponent implements OnInit {
	loading: boolean = false;
	company: Company | null = null;
	dialogRef?: DynamicDialogRef;
	uploadingLogo: boolean = false;
	selectedLogoFile: File | null = null;
	logoPreview: string | null = null;

	constructor(
		private companyService: CompanyService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private confirmationService: ConfirmationService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCompany();
	}

	loadCompany() {
		this.loading = true;
		this.companyService.getCompany().subscribe({
			next: (data) => {
				if (data && data.id) {
					this.company = data;
				} else {
					this.company = null;
				}
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				// If company doesn't exist (404), this is expected - not an error
				// System will use dummy profile data in public interfaces
				if (error.status === 404 || error.status === 204) {
					this.company = null;
					// No error message shown - this is expected behavior
				} else {
					// Only show error for actual failures (network issues, server errors, etc.)
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to load company information',
					});
				}
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openCreateCompanyProfileModal() {
		const ref = this.dialogService.open(CreateCompanyProfileComponent, {
			header: 'Create Company Profile',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {},
		});

		if (ref) {
			ref.onClose.subscribe((result) => {
				// If dialog was closed with a result (success), reload company data
				if (result) {
					this.loadCompany();
				}
			});
		}
	}

	openUpdateCompanyProfileModal() {
		if (!this.company) {
			// If no company exists, show error message
			this.messageService.add({
				severity: 'warn',
				summary: 'No Company Profile',
				detail: 'Please create a company profile first',
			});
			return;
		}

		const ref = this.dialogService.open(UpdateCompanyProfileComponent, {
			header: 'Update Company Profile',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				company: this.company,
			},
		});

		if (ref) {
			ref.onClose.subscribe((result) => {
				// If dialog was closed with a result (success), reload company data
				if (result) {
					this.loadCompany();
				}
			});
		}
	}

	getLogoUrl(): string {
		if (!this.company) {
			return '/product-placeholder.png';
		}
		// Use the logo endpoint to get the logo
		return this.companyService.getLogoUrl();
	}

	onLogoFileSelect(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const file = input.files[0];
			
			// Validate file type
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				this.messageService.add({
					severity: 'error',
					summary: 'Invalid File Type',
					detail: 'Please select a valid image file (jpg, jpeg, png, gif, or webp)',
				});
				input.value = '';
				return;
			}

			// Validate file size (5MB = 5 * 1024 * 1024 bytes)
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				this.messageService.add({
					severity: 'error',
					summary: 'File Too Large',
					detail: 'Logo file size must be less than 5MB',
				});
				input.value = '';
				return;
			}

			this.selectedLogoFile = file;
			
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				this.logoPreview = e.target?.result as string;
				this.cdr.markForCheck();
			};
			reader.readAsDataURL(file);
		}
	}

	uploadLogo(): void {
		if (!this.selectedLogoFile) {
			this.messageService.add({
				severity: 'warn',
				summary: 'No File Selected',
				detail: 'Please select a logo file to upload',
			});
			return;
		}

		if (!this.company) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Company Profile Required',
				detail: 'Please create a company profile first before uploading a logo',
			});
			return;
		}

		this.uploadingLogo = true;
		this.companyService.uploadLogo(this.selectedLogoFile).subscribe({
			next: (updatedCompany) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Logo uploaded successfully',
				});
				this.company = updatedCompany;
				this.selectedLogoFile = null;
				this.logoPreview = null;
				// Reset file input
				const fileInput = document.getElementById('logoFileInput') as HTMLInputElement;
				if (fileInput) {
					fileInput.value = '';
				}
				this.uploadingLogo = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				let errorMessage = 'Failed to upload logo';
				if (error.error?.message) {
					if (Array.isArray(error.error.message)) {
						errorMessage = error.error.message.join(', ');
					} else if (typeof error.error.message === 'string') {
						errorMessage = error.error.message;
					}
				}
				this.messageService.add({
					severity: 'error',
					summary: 'Upload Failed',
					detail: errorMessage,
				});
				this.uploadingLogo = false;
				this.cdr.markForCheck();
			},
		});
	}

	cancelLogoUpload(): void {
		this.selectedLogoFile = null;
		this.logoPreview = null;
		const fileInput = document.getElementById('logoFileInput') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
		this.cdr.markForCheck();
	}

	triggerFileInput(): void {
		const fileInput = document.getElementById('logoFileInput') as HTMLInputElement;
		if (fileInput) {
			fileInput.click();
		}
	}

	formatDate(date: Date | string | null | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	deleteCompany() {
		if (!this.company) {
			return;
		}

		this.confirmationService.confirm({
			message: `Are you sure you want to delete the company profile "${this.company.name}"? This action cannot be undone.`,
			header: 'Delete Company Profile',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.companyService.deleteCompany().subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Company profile deleted successfully',
						});
						this.company = null;
						this.loading = false;
						this.cdr.markForCheck();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete company profile',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
			},
		});
	}
}

