import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UserDataService } from '../../../../../core/dataservice/user/user.dataservice';
import { CreateUserDto, User } from '../../../../../core/dataservice/user/user.interface';
import { UserRole } from '../../../../../core/constants/enums';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-admin-create-user',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-create-user.component.html',
	styleUrls: ['./admin-create-user.component.scss'],
})
export class AdminCreateUserComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	createData: CreateUserDto = {
		name: '',
		cid: '',
		emailAddress: '',
		phoneNumber: '',
		password: '',
		role: UserRole.ADMIN,
		currentAddress: '',
		permanentAddress: '',
	};

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
		// Set default role from config if provided
		if (this.config?.data?.defaultRole) {
			this.createData.role = this.config.data.defaultRole;
		}
	}

	saveUser() {
		this.submitted = true;

		// Validate required fields
		if (!this.createData.name || !this.createData.cid || !this.createData.emailAddress || !this.createData.password) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		// Validate password length
		if (this.createData.password.length < 6) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Password must be at least 6 characters long',
			});
			return;
		}

		this.loading = true;

		this.userDataService.createUser(this.createData).subscribe({
			next: (user: User) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'User created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(user);
				} else {
					this.resetForm();
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create user';
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

	resetForm() {
		this.createData = {
			name: '',
			cid: '',
			emailAddress: '',
			phoneNumber: '',
			password: '',
			role: UserRole.ADMIN,
			currentAddress: '',
			permanentAddress: '',
		};
		this.submitted = false;
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
