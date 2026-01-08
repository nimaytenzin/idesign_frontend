import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import {
	CreateOrderDto,
	CreateOrderItemDto,
	CustomerDetailsDto,
	OrderType,
} from '../../../../core/dataservice/order/order.interface';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { Product } from '../../../../core/dataservice/product/product.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-place-order',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-place-order.component.html',
	styleUrls: ['./admin-place-order.component.scss'],
})
export class AdminPlaceOrderComponent implements OnInit {
	@Output() orderCreated = new EventEmitter<void>();
	
	loading: boolean = false;
	submitted: boolean = false;
	activeStep: number = 0;
	dialogRef?: DynamicDialogRef;

	// Step 1: Customer Details
	customer: CustomerDetailsDto = {
		name: '',
		email: '',
		phoneNumber: '',
		shippingAddress: '',
		billingAddress: '',
	};

	// Step 2: Products
	products: Product[] = [];
	orderItems: Array<CreateOrderItemDto & { product?: Product; lineTotal: number }> = [];
	selectedProduct: Product | null = null;
	quantity: number = 1;
	unitPrice: number = 0;
	discountApplied: number = 0;
	discountMode: 'amount' | 'percentage' = 'amount';
	discountPercentage: number = 0;

	// Step 3: Order Details
	shippingCost: number = 0;
	internalNotes: string = '';
	paymentMethod: PaymentMethod | null = null;
	orderType: OrderType = OrderType.ONLINE;
	orderDiscount: number = 0;
	voucherCode: string = '';
	OrderType = OrderType;

	// Calculated
	subtotal: number = 0;
	totalAmount: number = 0;

	steps = [
		{ label: 'Customer', icon: 'pi pi-user' },
		{ label: 'Products', icon: 'pi pi-shopping-cart' },
		{ label: 'Review', icon: 'pi pi-check' },
	];

	constructor(
		private router: Router,
		private orderService: OrderService,
		private productService: ProductService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		public ref?: DynamicDialogRef,
		public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		this.loadProducts();
	}

	loadProducts() {
		this.productService.getAllProductsAdmin().subscribe({
			next: (data) => {
				this.products = data.filter((p) => p.isAvailable);
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load products',
				});
			},
		});
	}

	onProductSelect() {
		if (this.selectedProduct) {
			this.unitPrice = this.selectedProduct.price;
			this.quantity = 1;
			this.discountApplied = 0;
			this.discountPercentage = 0;
			this.cdr.markForCheck();
		}
	}

	onDiscountModeChange() {
		if (this.discountMode === 'percentage') {
			this.calculateDiscountFromPercentage();
		} else {
			this.discountPercentage = 0;
		}
	}

	onDiscountPercentageChange() {
		this.calculateDiscountFromPercentage();
	}

	calculateDiscountFromPercentage() {
		if (this.discountMode === 'percentage' && this.selectedProduct && this.quantity > 0) {
			const subtotal = this.unitPrice * this.quantity;
			this.discountApplied = (subtotal * this.discountPercentage) / 100;
		}
	}

	addLineItem() {
		if (!this.selectedProduct) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Please select a product',
			});
			return;
		}

		if (this.quantity <= 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Quantity must be greater than 0',
			});
			return;
		}

		// Calculate discount if in percentage mode
		let finalDiscount = this.discountApplied;
		if (this.discountMode === 'percentage') {
			const subtotal = this.unitPrice * this.quantity;
			finalDiscount = (subtotal * this.discountPercentage) / 100;
		}

		const lineTotal = (this.unitPrice * this.quantity) - finalDiscount;
		const lineItem: CreateOrderItemDto & { product?: Product; lineTotal: number } = {
			productId: this.selectedProduct.id,
			quantity: this.quantity,
			unitPrice: this.unitPrice,
			discountApplied: finalDiscount,
			product: this.selectedProduct,
			lineTotal: lineTotal,
		};

		this.orderItems.push(lineItem);
		this.selectedProduct = null;
		this.quantity = 1;
		this.unitPrice = 0;
		this.discountApplied = 0;
		this.discountPercentage = 0;
		this.discountMode = 'amount';
		this.calculateTotals();
	}

	removeLineItem(index: number) {
		this.orderItems.splice(index, 1);
		this.calculateTotals();
	}

	calculateTotals() {
		this.subtotal = this.orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
		this.totalAmount = this.subtotal + this.shippingCost;
	}

	onShippingCostChange() {
		this.calculateTotals();
	}

	nextStep() {
		if (this.activeStep === 0) {
			if (!this.customer.name && !this.customer.email) {
				this.messageService.add({
					severity: 'warn',
					summary: 'Warning',
					detail: 'Please provide at least customer name or email',
				});
				return;
			}
		} else if (this.activeStep === 1) {
			if (this.orderItems.length === 0) {
				this.messageService.add({
					severity: 'warn',
					summary: 'Warning',
					detail: 'Please add at least one product',
				});
				return;
			}
		}
		this.activeStep++;
	}

	prevStep() {
		if (this.activeStep > 0) {
			this.activeStep--;
		}
	}

	submitOrder() {
		this.submitted = true;

		if (!this.customer.name && !this.customer.email) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Customer name or email is required',
			});
			return;
		}

		if (this.orderItems.length === 0) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Please add at least one product',
			});
			return;
		}

		if (!this.paymentMethod) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Please select a payment method',
			});
			return;
		}

		this.loading = true;

		const orderData: CreateOrderDto = {
			customer: {
				name: this.customer.name || undefined,
				email: this.customer.email || undefined,
				phoneNumber: this.customer.phoneNumber || undefined,
				shippingAddress: this.customer.shippingAddress || undefined,
				billingAddress: this.customer.billingAddress || undefined,
			},
			orderItems: this.orderItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discountApplied: item.discountApplied,
			})),
			orderType: this.orderType,
			paymentMethod: this.paymentMethod || undefined,
			orderDiscount: this.orderDiscount > 0 ? this.orderDiscount : undefined,
			voucherCode: this.voucherCode || undefined,
			shippingCost: this.shippingCost || undefined,
			internalNotes: this.internalNotes || undefined,
		};

		this.orderService.createOrder(orderData).subscribe({
			next: (data) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Order created successfully',
				});
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.router.navigate(['/admin/orders']);
				}
				this.orderCreated.emit();
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

	cancel() {
		if (this.ref) {
			this.ref.close();
		} else {
			this.router.navigate(['/admin/orders']);
		}
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}
}

