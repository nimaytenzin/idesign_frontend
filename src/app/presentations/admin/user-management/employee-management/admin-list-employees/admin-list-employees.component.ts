import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { TieredMenu } from 'primeng/tieredmenu';
import { EmployeeManagementService } from '../../../../../core/dataservice/hr-management/employee-management.service';
import {
	StaffMember,
	EmployeeStatus,
} from '../../../../../core/dataservice/hr-management/employee-management.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { AdminEmployeeFormComponent } from '../admin-employee-form/admin-employee-form.component';
import { AdminResetPasswordComponent } from '../admin-reset-password/admin-reset-password.component';
import { AdminEducationListComponent } from '../admin-education-list/admin-education-list.component';
import { AdminWorkExperienceListComponent } from '../admin-work-experience-list/admin-work-experience-list.component';
import { AdminEmployeeBioComponent } from '../admin-employee-bio/admin-employee-bio.component';
import { AdminEmployeeUploadProfileComponent } from '../admin-employee-upload-profile/admin-employee-upload-profile.component';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-admin-list-employees',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-list-employees.component.html',
	styleUrls: ['./admin-list-employees.component.scss'],
})
export class AdminListEmployeesComponent implements OnInit, AfterViewInit {
	@ViewChild('employeeTable') employeeTable!: Table;
	@ViewChildren('actionMenu') actionMenus!: QueryList<TieredMenu>;

	employees: StaffMember[] = [];
	selectedEmployees: StaffMember[] = [];
	loading: boolean = false;
	globalFilter: string = '';
	
	// Map to store menu references by employee ID
	private menuMap: Map<number, TieredMenu> = new Map();

	// Filters
	statusFilter: EmployeeStatus | null = null;
	departmentFilter: string = '';

	// Filter options
	statusOptions = [
		{ label: 'All Statuses', value: null },
		{ label: 'Active', value: EmployeeStatus.ACTIVE },
		{ label: 'Inactive', value: EmployeeStatus.INACTIVE },
		{ label: 'Terminated', value: EmployeeStatus.TERMINATED },
	];

	// Pagination
	first: number = 0;
	rows: number = 10;
	totalRecords: number = 0;

	EmployeeStatus = EmployeeStatus;

	constructor(
		private employeeService: EmployeeManagementService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadEmployees();
	}

	ngAfterViewInit(): void {
		// Update menu map when menus change
		this.actionMenus.changes.subscribe(() => {
			this.updateMenuMap();
		});
		// Initial update
		setTimeout(() => this.updateMenuMap(), 0);
	}

	private updateMenuMap(): void {
		this.menuMap.clear();
		const menus = this.actionMenus.toArray();
		const visibleEmployees = this.getVisibleEmployees();
		
		// Match menus to employees by index
		menus.forEach((menu, index) => {
			if (index < visibleEmployees.length) {
				this.menuMap.set(visibleEmployees[index].id, menu);
			}
		});
	}

	private getVisibleEmployees(): StaffMember[] {
		// Get the currently visible employees (after filtering/pagination)
		if (this.employeeTable && this.employeeTable.filteredValue && this.employeeTable.filteredValue.length > 0) {
			return this.employeeTable.filteredValue;
		}
		// Fallback to paginated employees
		const startIndex = this.first;
		const endIndex = Math.min(startIndex + this.rows, this.employees.length);
		return this.employees.slice(startIndex, endIndex);
	}

	toggleActionMenu(event: Event, employee: StaffMember): void {
		event.stopPropagation();
		event.preventDefault();
		
		// Update menu map in case it's out of sync
		this.updateMenuMap();
		
		const menu = this.menuMap.get(employee.id);
		if (menu) {
			menu.toggle(event);
		} else {
			console.warn(`Menu not found for employee ${employee.id}`);
		}
	}

	getActionMenuItems(employee: StaffMember): any[] {
		return [
			{
				label: 'View Bio',
				icon: 'pi pi-user',
				command: (event: any) => {
					this.viewBio(employee);
				},
			},
			{
				label: 'Edit',
				icon: 'pi pi-pencil',
				command: (event: any) => {
					this.editEmployee(employee);
				},
			},
			{
				label: 'Upload Profile Picture',
				icon: 'pi pi-image',
				command: (event: any) => {
					this.uploadProfilePicture(employee);
				},
			},
			{
				separator: true,
			},
			{
				label: 'View Education',
				icon: 'pi pi-graduation-cap',
				command: (event: any) => {
					this.viewEducation(employee);
				},
			},
			{
				label: 'View Work Experience',
				icon: 'pi pi-briefcase',
				command: (event: any) => {
					this.viewWorkExperience(employee);
				},
			},
			{
				separator: true,
			},
			{
				label: 'Reset Password',
				icon: 'pi pi-key',
				command: (event: any) => {
					this.resetPassword(employee);
				},
			},
			{
				label: 'Delete',
				icon: 'pi pi-trash',
				command: (event: any) => {
					this.deleteEmployee(employee);
				},
			},
		];
	}

	loadEmployees() {
		this.loading = true;
		this.employeeService.getAllStaffMembers().subscribe({
			next: (data) => {
				this.employees = data;
				this.totalRecords = data.length;
				this.loading = false;
				this.cdr.markForCheck();
				// Update menu map after data loads
				setTimeout(() => this.updateMenuMap(), 100);
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load employees',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	onPageChange(event: any): void {
		this.first = event.first;
		this.rows = event.rows;
		this.totalRecords = this.employees.length;
		// Update menu map after pagination changes
		setTimeout(() => this.updateMenuMap(), 0);
	}

	onFilterChange() {
		// Filtering is handled by PrimeNG table, but we can trigger reload if needed
		if (this.employeeTable) {
			this.employeeTable.filter(this.statusFilter, 'employeeStatus', 'equals');
			if (this.departmentFilter) {
				this.employeeTable.filter(
					this.departmentFilter,
					'department',
					'contains'
				);
			}
		}
	}

	clearFilters() {
		this.globalFilter = '';
		this.statusFilter = null;
		this.departmentFilter = '';
		if (this.employeeTable) {
			this.employeeTable.clear();
			this.employeeTable.reset();
		}
	}

	openNewEmployee() {
		const ref = this.dialogService.open(AdminEmployeeFormComponent, {
			header: 'Create New Employee',
			width: '90%',
			style: { 'max-width': '900px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadEmployees();
			}
		});
	}

	editEmployee(employee: StaffMember) {
		const ref = this.dialogService.open(AdminEmployeeFormComponent, {
			header: 'Edit Employee',
			width: '90%',
			style: { 'max-width': '900px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadEmployees();
			}
		});
	}

	resetPassword(employee: StaffMember) {
		const ref = this.dialogService.open(AdminResetPasswordComponent, {
			header: 'Reset Password',
			width: '90%',
			style: { 'max-width': '500px' },
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Password reset successfully',
				});
			}
		});
	}

	deleteEmployee(employee: StaffMember) {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete employee "${employee.name}"? This action cannot be undone.`,
			header: 'Delete Employee',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.employeeService.deleteStaffMember(employee.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Employee deleted successfully',
						});
						this.loadEmployees();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete employee',
						});
					},
				});
			},
		});
	}

	viewEducation(employee: StaffMember) {
		const ref = this.dialogService.open(AdminEducationListComponent, {
			header: 'Education Qualifications',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee },
		});
	}

	viewWorkExperience(employee: StaffMember) {
		const ref = this.dialogService.open(AdminWorkExperienceListComponent, {
			header: 'Work Experience',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee },
		});
	}

	viewBio(employee: StaffMember) {
		this.dialogService.open(AdminEmployeeBioComponent, {
			header: `Employee Bio - ${employee.name}`,
			width: '90%',
			style: { 'max-width': '900px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee },
		});
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	getStatusClasses(status: EmployeeStatus): string {
		switch (status) {
			case EmployeeStatus.ACTIVE:
				return 'text-xs rounded-full px-2 py-0.5 font-medium bg-green-50 text-green-700 dark:bg-green-500 dark:bg-opacity-15 dark:text-green-500';
			case EmployeeStatus.INACTIVE:
				return 'text-xs rounded-full px-2 py-0.5 font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-500 dark:bg-opacity-15 dark:text-yellow-500';
			case EmployeeStatus.TERMINATED:
				return 'text-xs rounded-full px-2 py-0.5 font-medium bg-red-50 text-red-700 dark:bg-red-500 dark:bg-opacity-15 dark:text-red-500';
			default:
				return 'text-xs rounded-full px-2 py-0.5 font-medium bg-gray-50 text-gray-700 dark:bg-gray-500 dark:bg-opacity-15 dark:text-gray-500';
		}
	}

	getUniqueDepartments(): string[] {
		const departments = this.employees
			.map((e) => e.department)
			.filter((d): d is string => !!d);
		return [...new Set(departments)].sort();
	}

	onStatusFilterChange(event: any): void {
		this.statusFilter = event.value;
		if (this.employeeTable) {
			if (event.value !== null) {
				this.employeeTable.filter(event.value, 'employeeStatus', 'equals');
			} else {
				this.employeeTable.filter(null, 'employeeStatus', 'equals');
			}
		}
		// Update menu map after filtering
		setTimeout(() => this.updateMenuMap(), 0);
	}

	getProfileImageUrl(employee: StaffMember): string | undefined {
		if (!employee.profileImageUrl) {
			return undefined;
		}
		// If the URL already starts with http, return as is
		if (employee.profileImageUrl.startsWith('http')) {
			return employee.profileImageUrl;
		}
		// Otherwise, construct the full URL
		const cleanPath = employee.profileImageUrl.startsWith('/')
			? employee.profileImageUrl.substring(1)
			: employee.profileImageUrl;
		return `${environment.BASEAPI_URL}/${cleanPath}`;
	}

	getEmployeeInitial(employee: StaffMember): string {
		if (!employee.name) {
			return 'U';
		}
		return employee.name.charAt(0).toUpperCase();
	}

	uploadProfilePicture(employee: StaffMember) {
		const ref = this.dialogService.open(AdminEmployeeUploadProfileComponent, {
			header: 'Upload Profile Picture',
			width: '90%',
			style: { 'max-width': '600px' },
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employee },
		});

		ref.onClose.subscribe((updatedEmployee: StaffMember | boolean) => {
			if (updatedEmployee && typeof updatedEmployee !== 'boolean') {
				// Update the employee in the list
				const index = this.employees.findIndex(e => e.id === updatedEmployee.id);
				if (index !== -1) {
					this.employees[index] = updatedEmployee;
				}
				this.loadEmployees();
			}
		});
	}
}

