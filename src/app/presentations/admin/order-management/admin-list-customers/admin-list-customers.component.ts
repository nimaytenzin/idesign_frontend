import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CustomerService } from '../../../../core/dataservice/customer/customer.service';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../../../../core/dataservice/customer/customer.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-list-customers',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService],
	templateUrl: './admin-list-customers.component.html',
	styleUrls: ['./admin-list-customers.component.scss'],
})
export class AdminListCustomersComponent implements OnInit {
	customers: Customer[] = [];
	filteredCustomers: Customer[] = [];
	selectedCustomers: Customer[] = [];
	customerDialog: boolean = false;
	deleteCustomerDialog: boolean = false;
	customer: Partial<Customer> = {};
	submitted: boolean = false;
	loading: boolean = false;
	globalFilter: string = '';

	constructor(
		private customerService: CustomerService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private router: Router,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCustomers();
	}

	loadCustomers() {
		this.loading = true;
		this.customerService.getCustomers().subscribe({
			next: (data) => {
				this.customers = data;
				this.filteredCustomers = [...data];
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load customers',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openNew() {
		this.customer = {};
		this.submitted = false;
		this.customerDialog = true;
	}

	editCustomer(customer: Customer) {
		this.customer = { ...customer };
		this.customerDialog = true;
	}

	deleteCustomer(customer: Customer) {
		this.customer = { ...customer };
		this.deleteCustomerDialog = true;
	}

	confirmDelete() {
		if (this.customer.id) {
			this.customerService.deleteCustomer(this.customer.id).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Customer deleted successfully',
					});
					this.loadCustomers();
					this.deleteCustomerDialog = false;
					this.customer = {};
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete customer',
					});
				},
			});
		}
	}

	saveCustomer() {
		this.submitted = true;

		if (!this.customer.name || !this.customer.email) {
			return;
		}

		if (this.customer.id) {
			const updateData: UpdateCustomerDto = {
				name: this.customer.name,
				email: this.customer.email,
				phoneNumber: this.customer.phoneNumber,
				shippingAddress: this.customer.shippingAddress,
				billingAddress: this.customer.billingAddress,
			};
			this.customerService.updateCustomer(this.customer.id, updateData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Customer updated successfully',
					});
					this.loadCustomers();
					this.customerDialog = false;
					this.customer = {};
					this.submitted = false;
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update customer',
					});
				},
			});
		} else {
			const createData: CreateCustomerDto = {
				name: this.customer.name!,
				email: this.customer.email!,
				phoneNumber: this.customer.phoneNumber,
				shippingAddress: this.customer.shippingAddress,
				billingAddress: this.customer.billingAddress,
			};
			this.customerService.createCustomer(createData).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Customer created successfully',
					});
					this.loadCustomers();
					this.customerDialog = false;
					this.customer = {};
					this.submitted = false;
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create customer',
					});
				},
			});
		}
	}

	onGlobalFilter(event: any) {
		const value = (event?.target?.value ?? '').toLowerCase();
		this.applyFilter(value);
	}

	onGlobalFilterFromValue(value: string) {
		this.applyFilter((value ?? '').toLowerCase());
	}

	clearSearch() {
		this.globalFilter = '';
		this.filteredCustomers = [...this.customers];
	}

	private applyFilter(value: string) {
		if (!value.trim()) {
			this.filteredCustomers = [...this.customers];
			return;
		}
		this.filteredCustomers = this.customers.filter(
			(c) =>
				(c.name && c.name.toLowerCase().includes(value)) ||
				(c.email && c.email.toLowerCase().includes(value)) ||
				(c.phoneNumber && c.phoneNumber.toLowerCase().includes(value))
		);
	}

	createOrderForCustomer(customer: Customer) {
		this.router.navigate(['/admin/orders/new'], { queryParams: { customerId: customer.id } });
	}
}

