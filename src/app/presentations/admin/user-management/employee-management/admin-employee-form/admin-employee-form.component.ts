import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeManagementService } from '../../../../../core/dataservice/hr-management/employee-management.service';
import {
	StaffMember,
	CreateStaffMemberDto,
	UpdateStaffMemberDto,
	EmployeeStatus,
} from '../../../../../core/dataservice/hr-management/employee-management.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-admin-employee-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-employee-form.component.html',
	styleUrls: ['./admin-employee-form.component.scss'],
})
export class AdminEmployeeFormComponent implements OnInit {
	employee: Partial<StaffMember> = {};
	isEditMode: boolean = false;
	submitted: boolean = false;
	loading: boolean = false;

	// Form fields
	name: string = '';
	cid: string = '';
	emailAddress: string = '';
	password: string = '';
	phoneNumber: string = '';
	department: string = '';
	position: string = '';
	address: string = '';
	dateOfBirth: string = '';
	hireDate: string = '';
	employeeStatus: EmployeeStatus = EmployeeStatus.ACTIVE;
	terminationDate: string = '';
	profileImageUrl: string = '';

	// Options
	statusOptions = [
		{ label: 'Active', value: EmployeeStatus.ACTIVE },
		{ label: 'Inactive', value: EmployeeStatus.INACTIVE },
		{ label: 'Terminated', value: EmployeeStatus.TERMINATED },
	];

	EmployeeStatus = EmployeeStatus;

	constructor(
		private employeeService: EmployeeManagementService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		// Check if editing existing employee
		if (this.config.data?.employee) {
			const emp = this.config.data.employee as StaffMember;
			this.employee = { ...emp };
			this.isEditMode = true;
			this.loadEmployeeData(emp);
		} else {
			// Initialize with defaults for new employee
			this.employeeStatus = EmployeeStatus.ACTIVE;
			this.hireDate = new Date().toISOString().split('T')[0];
		}
	}

	ngOnInit() {
		// Component initialized
	}

	loadEmployeeData(emp: StaffMember) {
		this.name = emp.name || '';
		this.cid = emp.cid || '';
		this.emailAddress = emp.emailAddress || '';
		this.phoneNumber = emp.phoneNumber || '';
		this.department = emp.department || '';
		this.position = emp.position || '';
		this.address = emp.address || '';
		this.employeeStatus = emp.employeeStatus || EmployeeStatus.ACTIVE;
		this.profileImageUrl = emp.profileImageUrl || '';

		// Format dates for input fields
		if (emp.dateOfBirth) {
			const dob = typeof emp.dateOfBirth === 'string' ? new Date(emp.dateOfBirth) : emp.dateOfBirth;
			this.dateOfBirth = dob.toISOString().split('T')[0];
		}
		if (emp.hireDate) {
			const hire = typeof emp.hireDate === 'string' ? new Date(emp.hireDate) : emp.hireDate;
			this.hireDate = hire.toISOString().split('T')[0];
		}
		if (emp.terminationDate) {
			const term = typeof emp.terminationDate === 'string' ? new Date(emp.terminationDate) : emp.terminationDate;
			this.terminationDate = term.toISOString().split('T')[0];
		}
	}

	saveEmployee() {
		this.submitted = true;

		// Validation
		if (!this.name || !this.cid || !this.emailAddress) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please fill in all required fields (Name, CID, Email)',
			});
			return;
		}

		if (!this.isEditMode && !this.password) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Password is required for new employees',
			});
			return;
		}

		if (this.password && this.password.length < 6) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Password must be at least 6 characters long',
			});
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(this.emailAddress)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please enter a valid email address',
			});
			return;
		}

		this.loading = true;

		if (this.isEditMode && this.employee.id) {
			// Update existing employee
			const updateData: UpdateStaffMemberDto = {
				name: this.name,
				cid: this.cid,
				emailAddress: this.emailAddress,
				phoneNumber: this.phoneNumber || undefined,
				department: this.department || undefined,
				position: this.position || undefined,
				address: this.address || undefined,
				dateOfBirth: this.dateOfBirth || undefined,
				hireDate: this.hireDate || undefined,
				employeeStatus: this.employeeStatus,
				terminationDate: this.terminationDate || undefined,
				profileImageUrl: this.profileImageUrl || undefined,
			};

			this.employeeService.updateStaffMember(this.employee.id, updateData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Employee updated successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update employee',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			// Create new employee
			const createData: CreateStaffMemberDto = {
				name: this.name,
				cid: this.cid,
				emailAddress: this.emailAddress,
				password: this.password,
				phoneNumber: this.phoneNumber || undefined,
				department: this.department || undefined,
				position: this.position || undefined,
				address: this.address || undefined,
				dateOfBirth: this.dateOfBirth || undefined,
				hireDate: this.hireDate || undefined,
				profileImageUrl: this.profileImageUrl || undefined,
			};

			this.employeeService.createStaffMember(createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Employee created successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create employee',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	cancel() {
		this.ref.close(false);
	}
}

