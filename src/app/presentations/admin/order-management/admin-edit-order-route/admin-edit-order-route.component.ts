import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { CustomerService } from '../../../../core/dataservice/customer/customer.service';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import {
	Order,
	CreateOrderDto,
	UpdateOrderDto,
	CreateOrderItemDto,
	FulfillmentStatus,
} from '../../../../core/dataservice/order/order.interface';
import { Customer } from '../../../../core/dataservice/customer/customer.interface';
import { Product } from '../../../../core/dataservice/product/product.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-edit-order-route',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-edit-order-route.component.html',
	styleUrls: ['./admin-edit-order-route.component.scss'],
})
export class AdminEditOrderRouteComponent implements OnInit {
	orderId: number | null = null;
	isEditMode: boolean = false;
	activeStep: number = 0;
	loading: boolean = false;
	submitted: boolean = false;

	// Step 1: Customer
	customers: Customer[] = [];
	selectedCustomer: Customer | null = null;
	showNewCustomerForm: boolean = false;
	newCustomer: Partial<Customer> = {};

	// Step 2: Products
	products: Product[] = [];
	availableProducts: Product[] = [];
	orderItems: Array<CreateOrderItemDto & { product?: Product; lineTotal: number }> = [];
	selectedProduct: Product | null = null;
	quantity: number = 1;
	unitPrice: number = 0;
	discountApplied: number = 0;

	// Step 3: Order Details
	shippingCost: number = 0;
	internalNotes: string = '';

	// Calculated
	totalAmount: number = 0;

	steps = [
		{ label: 'Customer' },
		{ label: 'Products' },
		{ label: 'Review' },
	];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private orderService: OrderService,
		private customerService: CustomerService,
		private productService: ProductService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCustomers();
		this.loadProducts();
		this.route.params.subscribe((params) => {
			if (params['id']) {
				this.orderId = +params['id'];
				this.isEditMode = true;
				this.loadOrder();
			}
		});
		this.route.queryParams.subscribe((params) => {
			if (params['customerId']) {
				this.loadCustomerById(+params['customerId']);
			}
		});
	}

	loadCustomers() {
		this.customerService.getCustomers().subscribe({
			next: (data) => {
				this.customers = data;
				this.cdr.markForCheck();
			},
		});
	}

	loadCustomerById(id: number) {
		this.customerService.getCustomerById(id).subscribe({
			next: (data) => {
				this.selectedCustomer = data;
				this.cdr.markForCheck();
			},
		});
	}

	loadProducts() {
		this.productService.getProducts({ availability: true }).subscribe({
			next: (data) => {
				this.products = data;
				this.availableProducts = data.filter((p) => p.isAvailable);
				this.cdr.markForCheck();
			},
		});
	}

	loadOrder() {
		if (!this.orderId) return;
		this.loading = true;
		this.orderService.getOrderById(this.orderId).subscribe({
			next: (data) => {
				this.selectedCustomer = data.customer || null;
				this.orderItems = (data.orderItems || []).map((item: any) => ({
					productId: item.productId,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					discountApplied: item.discountApplied,
					lineTotal: item.lineTotal,
					product: item.product,
				}));
				this.shippingCost = data.shippingCost;
				this.internalNotes = data.internalNotes || '';
				this.calculateTotal();
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load order',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	createNewCustomer() {
		if (!this.newCustomer.name || !this.newCustomer.email) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Name and email are required',
			});
			return;
		}

		this.customerService.createCustomer(this.newCustomer as any).subscribe({
			next: (data) => {
				this.selectedCustomer = data;
				this.customers.push(data);
				this.showNewCustomerForm = false;
				this.newCustomer = {};
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Customer created successfully',
				});
				this.cdr.markForCheck();
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

	onProductSelect() {
		if (this.selectedProduct) {
			this.unitPrice = this.selectedProduct.price;
			this.quantity = 1;
			this.discountApplied = 0;
		}
	}

	addLineItem() {
		if (!this.selectedProduct) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select a product',
			});
			return;
		}

		if (this.quantity <= 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Quantity must be greater than 0',
			});
			return;
		}

		const lineTotal = this.quantity * this.unitPrice - this.discountApplied;
		if (lineTotal < 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Discount cannot exceed line total',
			});
			return;
		}

		this.orderItems.push({
			productId: this.selectedProduct.id,
			quantity: this.quantity,
			unitPrice: this.unitPrice,
			discountApplied: this.discountApplied,
			lineTotal: lineTotal,
			product: this.selectedProduct,
		});

		this.selectedProduct = null;
		this.quantity = 1;
		this.unitPrice = 0;
		this.discountApplied = 0;
		this.calculateTotal();
	}

	removeLineItem(index: number) {
		this.orderItems.splice(index, 1);
		this.calculateTotal();
	}

	calculateTotal() {
		const itemsTotal = this.orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
		this.totalAmount = itemsTotal + this.shippingCost;
	}

	onShippingCostChange() {
		this.calculateTotal();
	}

	nextStep() {
		if (this.activeStep === 0 && !this.selectedCustomer) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select or create a customer',
			});
			return;
		}
		if (this.activeStep === 1 && this.orderItems.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please add at least one product',
			});
			return;
		}
		this.activeStep++;
	}

	prevStep() {
		this.activeStep--;
	}

	saveOrder() {
		this.submitted = true;

		if (!this.selectedCustomer || this.orderItems.length === 0) {
			return;
		}

		this.loading = true;

		const orderData: CreateOrderDto | UpdateOrderDto = {
			orderItems: this.orderItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discountApplied: item.discountApplied,
			})),
			shippingCost: this.shippingCost,
			internalNotes: this.internalNotes || undefined,
		};

		if (this.isEditMode && this.orderId) {
			this.orderService.updateOrder(this.orderId, orderData as UpdateOrderDto).subscribe({
				next: (data) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Order updated successfully',
					});
					this.router.navigate(['/admin/orders', data.id]);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update order',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			this.orderService.createOrder(orderData as CreateOrderDto).subscribe({
				next: (data) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: `Order ${data.orderNumber} created successfully`,
					});
					this.router.navigate(['/admin/orders', data.id]);
				},
				error: (error) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create order',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	cancel() {
		this.router.navigate(['/admin/orders']);
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}
}

