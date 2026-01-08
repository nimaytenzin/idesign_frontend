import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import {
	Order,
	FulfillmentStatus,
	UpdateOrderDto,
	UpdateOrderStatusDto,
	CreateOrderItemDto,
} from '../../../../core/dataservice/order/order.interface';
import { Product } from '../../../../core/dataservice/product/product.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-edit-order',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-edit-order.component.html',
	styleUrls: ['./admin-edit-order.component.scss'],
})
export class AdminEditOrderComponent implements OnInit {
	order: Order | null = null;
	loading: boolean = false;
	submitted: boolean = false;
	activeStep: number = 0;

	// Products
	products: Product[] = [];
	orderItems: Array<CreateOrderItemDto & { product?: Product; lineTotal: number; id?: number }> = [];
	selectedProduct: Product | null = null;
	quantity: number = 1;
	unitPrice: number = 0;
	discountApplied: number = 0;
	discountMode: 'amount' | 'percentage' = 'amount';
	discountPercentage: number = 0;

	// Order Details
	shippingCost: number = 0;
	internalNotes: string = '';
	fulfillmentStatus: FulfillmentStatus = FulfillmentStatus.PLACED;

	// Calculated
	subtotal: number = 0;
	totalAmount: number = 0;

	FulfillmentStatus = FulfillmentStatus;

	statusOptions = [
		{ label: 'Placed', value: FulfillmentStatus.PLACED },
		{ label: 'Confirmed', value: FulfillmentStatus.CONFIRMED },
		{ label: 'Processing', value: FulfillmentStatus.PROCESSING },
		{ label: 'Shipping', value: FulfillmentStatus.SHIPPING },
		{ label: 'Delivered', value: FulfillmentStatus.DELIVERED },
		{ label: 'Canceled', value: FulfillmentStatus.CANCELED },
	];

	steps = [
		{ label: 'Items', icon: 'pi pi-shopping-cart' },
		{ label: 'Details', icon: 'pi pi-cog' },
		{ label: 'Review', icon: 'pi pi-check' },
	];

	constructor(
		private orderService: OrderService,
		private productService: ProductService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit() {
		const orderId = this.config.data?.orderId;
		if (orderId) {
			this.loadOrder(orderId);
		} else if (this.config.data?.order) {
			this.order = this.config.data.order;
			this.initializeForm();
		}
		this.loadProducts();
	}

	loadOrder(id: number) {
		this.loading = true;
		this.orderService.getOrderById(id).subscribe({
			next: (data) => {
				this.order = data;
				this.initializeForm();
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
				this.ref.close();
				this.cdr.markForCheck();
			},
		});
	}

	initializeForm() {
		if (!this.order) return;

		this.shippingCost = this.order.shippingCost;
		this.internalNotes = this.order.internalNotes || '';
		this.fulfillmentStatus = this.order.fulfillmentStatus;

		if (this.order.orderItems) {
			this.orderItems = this.order.orderItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discountApplied: item.discountApplied || 0,
				product: item.product,
				lineTotal: item.lineTotal,
				id: item.id,
			}));
		}

		this.calculateTotals();
	}

	loadProducts() {
		this.productService.getAllProductsAdmin().subscribe({
			next: (data) => {
				this.products = data.filter((p) => p.isAvailable);
				this.cdr.markForCheck();
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

	saveOrder() {
		if (!this.order) return;

		this.submitted = true;
		this.loading = true;

		const updateData: UpdateOrderDto = {
			orderItems: this.orderItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discountApplied: item.discountApplied,
			})),
			shippingCost: this.shippingCost || undefined,
			internalNotes: this.internalNotes || undefined,
		};

		// Update order
		this.orderService.updateOrder(this.order.id, updateData).subscribe({
			next: () => {
				// Update status if changed
				if (this.fulfillmentStatus !== this.order!.fulfillmentStatus) {
					const statusData: UpdateOrderStatusDto = {
						fulfillmentStatus: this.fulfillmentStatus,
						internalNotes: this.internalNotes || undefined,
					};
					this.orderService.updateOrderStatus(this.order!.id, statusData).subscribe({
						next: () => {
							this.messageService.add({
								severity: 'success',
								summary: 'Success',
								detail: 'Order updated successfully',
							});
							this.ref.close(true);
						},
						error: () => {
							this.loading = false;
							this.cdr.markForCheck();
						},
					});
				} else {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Order updated successfully',
					});
					this.ref.close(true);
				}
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
	}

	close() {
		this.ref.close();
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}
}

