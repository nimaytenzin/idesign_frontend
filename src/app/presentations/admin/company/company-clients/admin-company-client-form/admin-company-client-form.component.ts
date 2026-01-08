import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CompanyClientService } from '../../../../../core/dataservice/company-client/company-client.service';
import { CompanyClient } from '../../../../../core/dataservice/company-client/company-client.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-admin-company-client-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-company-client-form.component.html',
	styleUrls: ['./admin-company-client-form.component.scss'],
})
export class AdminCompanyClientFormComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	isEditMode: boolean = false;
	clientId?: number;

	// Form Data
	name: string = '';
	websiteUrl: string = '';
	socialMediaUrl: string = '';
	isActive: boolean = true;

	// File Upload
	selectedFile: File | null = null;
	uploadedFiles: File[] = [];
	previewUrl: string | null = null;
	existingLogoUrl: string | null = null;

	MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

	constructor(
		private companyClientService: CompanyClientService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit(): void {
		if (this.config.data?.client) {
			this.isEditMode = true;
			this.clientId = this.config.data.client.id;
			this.loadClient(this.config.data.client);
		}
	}

	loadClient(client: CompanyClient): void {
		this.name = client.name;
		this.websiteUrl = client.websiteUrl || '';
		this.socialMediaUrl = client.socialMediaUrl || '';
		this.isActive = client.isActive;
		this.existingLogoUrl = client.logo || null;
		if (client.logo) {
			this.previewUrl = this.getImageUrl(client.logo);
		}
		this.cdr.markForCheck();
	}

	onFileSelect(event: any): void {
		const files = event.files;
		if (files && files.length > 0) {
			const file = files[0];

			// Validate file type
			if (!this.ALLOWED_TYPES.includes(file.type)) {
				this.messageService.add({
					severity: 'error',
					summary: 'Invalid File Type',
					detail: 'Only image files (JPEG, PNG, GIF, WebP) are allowed!',
				});
				event.clear();
				this.selectedFile = null;
				this.uploadedFiles = [];
				this.previewUrl = this.existingLogoUrl ? this.getImageUrl(this.existingLogoUrl) : null;
				this.cdr.markForCheck();
				return;
			}

			// Validate file size
			if (file.size > this.MAX_FILE_SIZE) {
				this.messageService.add({
					severity: 'error',
					summary: 'File Too Large',
					detail: 'File size must be less than 10MB!',
				});
				event.clear();
				this.selectedFile = null;
				this.uploadedFiles = [];
				this.previewUrl = this.existingLogoUrl ? this.getImageUrl(this.existingLogoUrl) : null;
				this.cdr.markForCheck();
				return;
			}

			// Store the file
			this.selectedFile = file;
			this.uploadedFiles = [file];

			// Create preview
			const reader = new FileReader();
			reader.onload = (e: any) => {
				this.previewUrl = e.target.result;
				this.cdr.markForCheck();
			};
			reader.onerror = () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to read image file',
				});
				this.selectedFile = null;
				this.uploadedFiles = [];
				this.cdr.markForCheck();
			};
			reader.readAsDataURL(file);
			this.cdr.markForCheck();
		}
	}

	onFileRemove(event: any): void {
		this.selectedFile = null;
		this.uploadedFiles = [];
		this.previewUrl = this.existingLogoUrl ? this.getImageUrl(this.existingLogoUrl) : null;
		this.cdr.markForCheck();
	}

	removeImage(): void {
		this.selectedFile = null;
		this.uploadedFiles = [];
		this.previewUrl = this.existingLogoUrl ? this.getImageUrl(this.existingLogoUrl) : null;
		this.cdr.markForCheck();
	}

	validateUrl(url: string): boolean {
		if (!url) return true; // Optional field
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}

	onSubmit(): void {
		this.submitted = true;

		if (!this.name.trim()) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Name is required',
			});
			return;
		}

		// Validate URLs if provided
		if (this.websiteUrl && !this.validateUrl(this.websiteUrl)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please enter a valid website URL',
			});
			return;
		}

		if (this.socialMediaUrl && !this.validateUrl(this.socialMediaUrl)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please enter a valid social media URL',
			});
			return;
		}

		this.loading = true;

		// If we have a file, use FormData; otherwise use simple JSON
		if (this.selectedFile) {
			const formData = new FormData();
			formData.append('name', this.name);
			if (this.websiteUrl) {
				formData.append('websiteUrl', this.websiteUrl);
			}
			if (this.socialMediaUrl) {
				formData.append('socialMediaUrl', this.socialMediaUrl);
			}
			formData.append('isActive', this.isActive ? 'true' : 'false');
			formData.append('logo', this.selectedFile);

			if (this.isEditMode && this.clientId) {
				this.updateClientWithFile(this.clientId, formData);
			} else {
				this.createClient(formData);
			}
		} else {
			// No file upload, use simple DTO
			const clientData: any = {
				name: this.name,
				isActive: this.isActive,
			};

			if (this.websiteUrl) {
				clientData.websiteUrl = this.websiteUrl;
			}
			if (this.socialMediaUrl) {
				clientData.socialMediaUrl = this.socialMediaUrl;
			}

			if (this.isEditMode && this.clientId) {
				this.updateClientSimple(this.clientId, clientData);
			} else {
				// For new clients without logo, still use FormData (empty) or create simple
				this.createClientSimple(clientData);
			}
		}
	}

	createClient(formData: FormData): void {
		this.companyClientService.createCompanyClient(formData).subscribe({
			next: (client) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Company client created successfully',
				});
				this.ref.close(client);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to create company client',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	createClientSimple(clientData: any): void {
		this.companyClientService.createCompanyClientSimple(clientData).subscribe({
			next: (client) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Company client created successfully',
				});
				this.ref.close(client);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to create company client',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	updateClientWithFile(id: number, formData: FormData): void {
		this.companyClientService.updateCompanyClient(id, formData).subscribe({
			next: (client) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Company client updated successfully',
				});
				this.ref.close(client);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to update company client',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	updateClientSimple(id: number, clientData: any): void {
		this.companyClientService.updateCompanyClientSimple(id, clientData).subscribe({
			next: (client) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Company client updated successfully',
				});
				this.ref.close(client);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to update company client',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	cancel(): void {
		this.ref.close();
	}

	getImageUrl(logoUri?: string): string {
		if (!logoUri) {
			return '/assets/images/no-image.png';
		}
		if (logoUri.startsWith('http')) {
			return logoUri;
		}
		return `${environment.BASEAPI_URL}${logoUri}`;
	}
}

