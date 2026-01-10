import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UserDataService } from '../../../../../core/dataservice/user/user.dataservice';
import { User } from '../../../../../core/dataservice/user/user.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-admin-upload-profile-picture',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-upload-profile-picture.component.html',
	styleUrls: ['./admin-upload-profile-picture.component.scss'],
})
export class AdminUploadProfilePictureComponent implements OnInit {
	loading: boolean = false;
	user: User | null = null;
	selectedFile: File | null = null;
	previewUrl: string | null = null;

	acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
	maxFileSize = 5 * 1024 * 1024; // 5MB

	constructor(
		private userDataService: UserDataService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.user = this.config.data.user;
		}
	}

	onFileSelect(event: any) {
		const file = event.files && event.files.length > 0 ? event.files[0] : null;
		
		if (!file) {
			return;
		}

		// Validate file type
		if (!this.acceptedFileTypes.includes(file.type)) {
			this.messageService.add({
				severity: 'error',
				summary: 'Invalid File Type',
				detail: 'Only image files are allowed (jpg, jpeg, png, gif, webp)',
			});
			return;
		}

		// Validate file size
		if (file.size > this.maxFileSize) {
			this.messageService.add({
				severity: 'error',
				summary: 'File Too Large',
				detail: 'File size must not exceed 5MB',
			});
			return;
		}

		this.selectedFile = file;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e: any) => {
			this.previewUrl = e.target.result;
			this.cdr.markForCheck();
		};
		reader.readAsDataURL(file);
	}

	onFileRemove() {
		this.selectedFile = null;
		this.previewUrl = null;
	}

	uploadProfilePicture() {
		if (!this.selectedFile || !this.user) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select a file to upload',
			});
			return;
		}

		this.loading = true;

		// Admin can upload profile picture for any user by passing userId
		// This allows admins to manage profile pictures for all users
		const userId = this.user.id;
		this.userDataService.uploadProfilePicture(this.selectedFile, userId).subscribe({
			next: (updatedUser: User) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Profile picture uploaded successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(updatedUser);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to upload profile picture';
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

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
