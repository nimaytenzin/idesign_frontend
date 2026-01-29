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
import { AdminCreateUserComponent } from '../../admin-management/components/admin-create-user/admin-create-user.component';
import { AdminUpdateUserComponent } from '../../admin-management/components/admin-update-user/admin-update-user.component';
import { AdminResetPasswordComponent } from '../../admin-management/components/admin-reset-password/admin-reset-password.component';
import { AdminUploadProfilePictureComponent } from '../../admin-management/components/admin-upload-profile-picture/admin-upload-profile-picture.component';
import { CreateEmployeeProfileComponent } from '../components/create-employee-profile/create-employee-profile.component';
import { UpdateEmployeeProfileComponent } from '../components/update-employee-profile/update-employee-profile.component';
import { AdminViewEmployeeCardComponent } from '../components/admin-view-employee-card/admin-view-employee-card.component';
import { EmployeeProfile } from '../../../../core/dataservice/hr-management/employee-profile/employee.profile.interface';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-admin-list-staffs',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, DialogService],
	templateUrl: './admin-list-staffs.component.html',
	styleUrls: ['./admin-list-staffs.component.scss'],
})
export class AdminListStaffsComponent implements OnInit {
	staffs: User[] = [];
	filteredStaffs: User[] = [];
	loading: boolean = false;
	globalFilter: string = '';
	
	// Pagination
	currentPage: number = 1;
	pageSize: number = 25;
	totalRecords: number = 0;
	totalPages: number = 0;
	
	// Filters
	roleFilter: UserRole | null = UserRole.STAFF;
	isActiveFilter: boolean | null = null;

	constructor(
		private userDataService: UserDataService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadStaffs();
	}

	loadStaffs() {
		this.loading = true;
		const queryDto: GetUsersQueryDto = {
			page: this.currentPage,
			limit: this.pageSize,
			role: UserRole.STAFF,
		};

		this.userDataService.getAllUsersPaginated(queryDto).subscribe({
			next: (response: PaginatedResponse<User>) => {
				this.staffs = response.data || [];
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
					detail: error.error?.message || 'Failed to load staffs',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onPageChange(event: any) {
		this.currentPage = (event.first / event.rows) + 1;
		this.pageSize = event.rows;
		this.loadStaffs();
	}

	applyFilters() {
		this.currentPage = 1;
		this.loadStaffs();
	}

	clearFilters() {
		this.globalFilter = '';
		this.isActiveFilter = null;
		this.currentPage = 1;
		this.loadStaffs();
	}

	onGlobalFilter() {
		this.applyClientSideFilters();
	}

	applyClientSideFilters() {
		let filtered = [...this.staffs];

		// Apply global search filter
		if (this.globalFilter) {
			const search = this.globalFilter.toLowerCase();
			filtered = filtered.filter(
				(staff) =>
					staff.name?.toLowerCase().includes(search) ||
					staff.emailAddress?.toLowerCase().includes(search) ||
					staff.cid?.toLowerCase().includes(search) ||
					staff.phoneNumber?.toLowerCase().includes(search)
			);
		}

		// Apply active status filter
		if (this.isActiveFilter !== null) {
			filtered = filtered.filter((staff) => staff.isActive === this.isActiveFilter);
		}

		this.filteredStaffs = filtered;
	}

	openCreateUserDialog() {
		const ref = this.dialogService.open(AdminCreateUserComponent, {
			header: 'Create New Staff',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				defaultRole: UserRole.STAFF,
			},
		});

		ref.onClose.subscribe((user: User) => {
			if (user) {
				this.loadStaffs();
			}
		});
	}

	editStaff(staff: User) {
		const ref = this.dialogService.open(AdminUpdateUserComponent, {
			header: 'Edit Staff',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				user: staff,
			},
		});

		ref.onClose.subscribe((updatedUser: User) => {
			if (updatedUser) {
				this.loadStaffs();
			}
		});
	}

	openResetPasswordDialog(staff: User) {
		const ref = this.dialogService.open(AdminResetPasswordComponent, {
			header: 'Reset Password',
			width: '500px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				user: staff,
			},
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				// Password reset successful, no need to reload list
			}
		});
	}

	openUploadProfilePictureDialog(staff: User) {
		const ref = this.dialogService.open(AdminUploadProfilePictureComponent, {
			header: 'Upload Profile Picture',
			width: '500px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				user: staff,
			},
		});

		ref.onClose.subscribe((updatedUser: User) => {
			if (updatedUser) {
				this.loadStaffs();
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

	parseImageUrl(profileImageUrl: string): string {
		if (!profileImageUrl) return '/product-placeholder.png';
		return `${environment.BASEAPI_URL}${profileImageUrl}`;
	}

	openCreateEmployeeProfileDialog(staff: User) {
		const ref = this.dialogService.open(CreateEmployeeProfileComponent, {
			header: 'Create Employee Profile',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				userId: staff.id,
			},
		});

		ref.onClose.subscribe((profile: EmployeeProfile) => {
			if (profile) {
				this.loadStaffs();
			}
		});
	}

	openUpdateEmployeeProfileDialog(staff: User) {
		if (!staff.employeeProfile) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Employee profile not found. Please create one first.',
			});
			return;
		}

		const ref = this.dialogService.open(UpdateEmployeeProfileComponent, {
			header: 'Update Employee Profile',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				employeeProfile: staff.employeeProfile,
			},
		});

		ref.onClose.subscribe((updatedProfile: EmployeeProfile) => {
			if (updatedProfile) {
				this.loadStaffs();
			}
		});
	}

	openViewEmployeeCard(staff: User) {
		const ref = this.dialogService.open(AdminViewEmployeeCardComponent, {
			header: 'Employee Details',
			width: '1200px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				staff: staff,
			},
		});

		ref.onClose.subscribe(() => {
			// Reload staff list to get updated data
			this.loadStaffs();
		});
	}
}
