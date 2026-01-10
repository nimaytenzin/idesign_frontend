import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UserDataService } from '../../../../../core/dataservice/user/user.dataservice';
import { UpdateUserDto, User } from '../../../../../core/dataservice/user/user.interface';
import { UserRole } from '../../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-admin-update-user',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-update-user.component.html',
	styleUrls: ['./admin-update-user.component.scss'],
})
export class AdminUpdateUserComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	user: User | null = null;
	updateData: UpdateUserDto = {};

	roleOptions = [
		{ label: 'Admin', value: UserRole.ADMIN },
		{ label: 'Staff', value: UserRole.STAFF },
		{ label: 'Affiliate Marketer', value: UserRole.AFFILIATE_MARKETER },
	];

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
			if (this.user) {
				// Convert dateOfBirth string to Date object if it exists
				const dateOfBirth = this.user.dateOfBirth
					? new Date(this.user.dateOfBirth)
					: undefined;

				this.updateData = {
					name: this.user.name,
					cid: this.user.cid,
					emailAddress: this.user.emailAddress,
					phoneNumber: this.user.phoneNumber,
					role: this.user.role,
					isActive: this.user.isActive,
					currentAddress: this.user.currentAddress,
					permanentAddress: this.user.permanentAddress,
					dateOfBirth: dateOfBirth,
				};
			}
		}
	}

	saveUser() {
		this.submitted = true;

		if (!this.user || !this.updateData.name || !this.updateData.emailAddress) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		this.loading = true;

		// Prepare update data with proper date handling
		const updatePayload: UpdateUserDto = { ...this.updateData };
		if (updatePayload.dateOfBirth instanceof Date) {
			// Keep as Date object - the service will handle serialization
			updatePayload.dateOfBirth = updatePayload.dateOfBirth;
		}

		this.userDataService.updateUser(this.user.id, updatePayload).subscribe({
			next: (updatedUser: User) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'User updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(updatedUser);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update user';
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
