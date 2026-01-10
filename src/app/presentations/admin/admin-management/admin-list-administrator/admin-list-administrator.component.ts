import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { UserDataService } from '../../../../core/dataservice/user/user.dataservice';
import { User, GetUsersQueryDto } from '../../../../core/dataservice/user/user.interface';
import { UserRole } from '../../../../core/constants/enums';
import { PaginatedResponse } from '../../../../core/constants/paginated.response.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminCreateUserComponent } from '../components/admin-create-user/admin-create-user.component';
import { AdminUpdateUserComponent } from '../components/admin-update-user/admin-update-user.component';
import { AdminResetPasswordComponent } from '../components/admin-reset-password/admin-reset-password.component';
import { AdminUploadProfilePictureComponent } from '../components/admin-upload-profile-picture/admin-upload-profile-picture.component';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-admin-list-administrator',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, DialogService],
	templateUrl: './admin-list-administrator.component.html',
	styleUrls: ['./admin-list-administrator.component.scss'],
})
export class AdminListAdministratorComponent implements OnInit {
	admins: User[] = [];
	filteredAdmins: User[] = [];
	loading: boolean = false;
	globalFilter: string = '';
	
	// Pagination
	currentPage: number = 1;
	pageSize: number = 25;
	totalRecords: number = 0;
	totalPages: number = 0;
	
	// Filters
	roleFilter: UserRole | null = UserRole.ADMIN;
	isActiveFilter: boolean | null = null;
admi: any;
admin: any;

	constructor(
		private userDataService: UserDataService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadAdmins();
	}

	loadAdmins() {
		this.loading = true;
		const queryDto: GetUsersQueryDto = {
			page: this.currentPage,
			limit: this.pageSize,
			role: UserRole.ADMIN,
		};

		this.userDataService.getAllUsersPaginated(queryDto).subscribe({
			next: (response: PaginatedResponse<User>) => {
				this.admins = response.data || [];
				this.applyClientSideFilters();
				this.totalRecords = response.meta?.total || 0;
				this.totalPages = response.meta?.totalPages || 0;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load administrators',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onPageChange(event: any) {
		this.currentPage = (event.first / event.rows) + 1; // Calculate page from first and rows
		this.pageSize = event.rows;
		this.loadAdmins();
	}

	applyFilters() {
		this.currentPage = 1;
		this.loadAdmins();
	}

	clearFilters() {
		this.globalFilter = '';
		this.isActiveFilter = null;
		this.currentPage = 1;
		this.loadAdmins();
	}

	onGlobalFilter() {
		this.applyClientSideFilters();
	}

	applyClientSideFilters() {
		let filtered = [...this.admins];

		// Apply global search filter
		if (this.globalFilter) {
			const search = this.globalFilter.toLowerCase();
			filtered = filtered.filter(
				(admin) =>
					admin.name?.toLowerCase().includes(search) ||
					admin.emailAddress?.toLowerCase().includes(search) ||
					admin.cid?.toLowerCase().includes(search) ||
					admin.phoneNumber?.toLowerCase().includes(search)
			);
		}

		// Apply active status filter
		if (this.isActiveFilter !== null) {
			filtered = filtered.filter((admin) => admin.isActive === this.isActiveFilter);
		}

		this.filteredAdmins = filtered;
	}

	openCreateUserDialog() {
		const ref = this.dialogService.open(AdminCreateUserComponent, {
			header: 'Create New User',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		ref.onClose.subscribe((user: User) => {
			if (user) {
				this.loadAdmins();
			}
		});
	}

	editAdmin(admin: User) {
		const ref = this.dialogService.open(AdminUpdateUserComponent, {
			header: 'Edit Administrator',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				user: admin,
			},
		});

		ref.onClose.subscribe((updatedUser: User) => {
			if (updatedUser) {
				this.loadAdmins();
			}
		});
	}

	openResetPasswordDialog(admin: User) {
		const ref = this.dialogService.open(AdminResetPasswordComponent, {
			header: 'Reset Password',
			width: '500px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				user: admin,
			},
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				// Password reset successful, no need to reload list
			}
		});
	}

	openUploadProfilePictureDialog(admin: User) {
		const ref = this.dialogService.open(AdminUploadProfilePictureComponent, {
			header: 'Upload Profile Picture',
			width: '500px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				user: admin,
			},
		});

		ref.onClose.subscribe((updatedUser: User) => {
			if (updatedUser) {
				this.loadAdmins();
			}
		});
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}


	parseImageUrl(profileImageUrl: string):string{
		
		return `${environment.BASEAPI_URL}${profileImageUrl}`;
	}
}
