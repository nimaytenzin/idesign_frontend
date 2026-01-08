import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TieredMenu } from 'primeng/tieredmenu';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { CustomerService } from '../../../../core/dataservice/customer/customer.service';
import {
	Order,
	FulfillmentStatus,
	PaymentStatus,
	OrderType,
	OrderQueryDto,
	UpdateFulfillmentStatusDto,
	UpdatePaymentStatusDto,
	DeliverOrderDto,
	CancelOrderDto,
	OrdersByMonthResponseDto,
	OrderStatisticsByMonthResponseDto,
} from '../../../../core/dataservice/order/order.interface';
import { Customer } from '../../../../core/dataservice/customer/customer.interface';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminPlaceOrderComponent } from '../admin-place-order/admin-place-order.component';
import { AdminViewInvoiceComponent } from '../admin-view-invoice/admin-view-invoice.component';
import { AdminViewReceiptComponent } from '../admin-view-receipt/admin-view-receipt.component';

@Component({
	selector: 'app-admin-list-orders',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, DialogService, ConfirmationService],
	templateUrl: './admin-list-orders.component.html',
	styleUrls: ['./admin-list-orders.component.scss'],
})
export class AdminListOrdersComponent implements OnInit, AfterViewInit {
	@ViewChildren('actionMenu') actionMenuList!: QueryList<TieredMenu>;

	FulfillmentStatus = FulfillmentStatus;
	PaymentStatus = PaymentStatus;
	OrderType = OrderType;

	// Action menu references
	public actionMenus: Map<number, TieredMenu> = new Map();

	orders: Order[] = [];
	filteredOrders: Order[] = [];
	loading: boolean = false;
	globalFilter: string = '';

	// Selected order for detail view
	selectedOrder: Order | null = null;

	// Filters
	customerFilter: number | null = null;
	fulfillmentStatusFilter: FulfillmentStatus | null = null;
	paymentStatusFilter: PaymentStatus | null = null;
	orderTypeFilter: OrderType | null = null;
	customers: Customer[] = [];

	// Monthly Statistics
	selectedYear: number = new Date().getFullYear();
	selectedMonth: number = new Date().getMonth() + 1;
	selectedDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
	monthlyStatistics: OrderStatisticsByMonthResponseDto | null = null;

	// Status update dialogs
	showFulfillmentDialog: boolean = false;
	showPaymentDialog: boolean = false;
	showDeliverDialog: boolean = false;
	showCancelDialog: boolean = false;
	selectedOrderForAction: Order | null = null;
	selectedFulfillmentStatus: FulfillmentStatus | null = null;
	selectedPaymentStatus: PaymentStatus | null = null;
	selectedPaymentMethod: PaymentMethod | null = null;
	transactionId: string = '';
	actionNotes: string = '';

	// Status Options
	fulfillmentStatusOptions = [
		{ label: 'All Status', value: null },
		{ label: 'Placed', value: FulfillmentStatus.PLACED },
		{ label: 'Confirmed', value: FulfillmentStatus.CONFIRMED },
		{ label: 'Processing', value: FulfillmentStatus.PROCESSING },
		{ label: 'Shipping', value: FulfillmentStatus.SHIPPING },
		{ label: 'Delivered', value: FulfillmentStatus.DELIVERED },
		{ label: 'Canceled', value: FulfillmentStatus.CANCELED },
	];

	paymentStatusOptions = [
		{ label: 'All Payment Status', value: null },
		{ label: 'Pending', value: PaymentStatus.PENDING },
		{ label: 'Paid', value: PaymentStatus.PAID },
		{ label: 'Failed', value: PaymentStatus.FAILED },
	];

	orderTypeOptions = [
		{ label: 'All Types', value: null },
		{ label: 'Counter', value: OrderType.COUNTER },
		{ label: 'Online', value: OrderType.ONLINE },
	];

	// Filtered options for dialogs
	get availableFulfillmentStatusOptions() {
		return this.fulfillmentStatusOptions.filter(
			(opt) =>
				opt.value !== null &&
				opt.value !== FulfillmentStatus.CANCELED &&
				opt.value !== FulfillmentStatus.DELIVERED
		);
	}

	get availablePaymentStatusOptions() {
		return this.paymentStatusOptions.filter((opt) => opt.value !== null);
	}

	paymentMethodOptions = [
		{ label: 'Cash', value: 'CASH' },
		{ label: 'MBOB', value: 'MBOB' },
		{ label: 'BDB EPay', value: 'BDB_EPAY' },
		{ label: 'TPay', value: 'TPAY' },
		{ label: 'BNB MPay', value: 'BNB_MPAY' },
		{ label: 'ZPSS', value: 'ZPSS' },
	];

	constructor(
		private orderService: OrderService,
		private customerService: CustomerService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private confirmationService: ConfirmationService,
		public router: Router,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCustomers();
		this.loadOrdersByMonth();
	}

	ngAfterViewInit(): void {
		this.actionMenuList.changes.subscribe(() => {
			this.updateMenuReferences();
		});
		setTimeout(() => this.updateMenuReferences(), 0);
	}

	private updateMenuReferences(): void {
		if (this.actionMenuList && this.actionMenuList.length > 0) {
			this.actionMenuList.forEach((menu: TieredMenu, index) => {
				if (this.filteredOrders[index]) {
					this.actionMenus.set(this.filteredOrders[index].id, menu);
				}
			});
		}
	}

	loadCustomers() {
		this.customerService.getCustomers().subscribe({
			next: (data) => {
				this.customers = data;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load customers',
				});
			},
		});
	}

	loadOrdersByMonth() {
		this.loading = true;
		const year = this.selectedYear;
		const month = this.selectedMonth;

		this.orderService.getOrdersByMonth(year, month).subscribe({
			next: (data: OrdersByMonthResponseDto) => {
				this.orders = data.orders || [];
				this.applyFilters();
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load orders',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});

		this.orderService.getOrderStatisticsByMonth(year, month).subscribe({
			next: (data) => {
				this.monthlyStatistics = data;
				this.cdr.markForCheck();
			},
			error: () => {
				// Silently fail for statistics
			},
		});
	}

	onMonthChange() {
		if (this.selectedDate) {
			this.selectedYear = this.selectedDate.getFullYear();
			this.selectedMonth = this.selectedDate.getMonth() + 1;
			this.loadOrdersByMonth();
		}
	}

	applyFilters() {
		let filtered = [...this.orders];

		// Apply global search filter
		if (this.globalFilter) {
			const search = this.globalFilter.toLowerCase();
			filtered = filtered.filter(
				(o) =>
					o.orderNumber?.toLowerCase().includes(search) ||
					o.customer?.name?.toLowerCase().includes(search) ||
					o.customer?.email?.toLowerCase().includes(search) ||
					o.customer?.phoneNumber?.toLowerCase().includes(search)
			);
		}

		// Apply fulfillment status filter
		if (this.fulfillmentStatusFilter) {
			filtered = filtered.filter(
				(order) => order.fulfillmentStatus === this.fulfillmentStatusFilter
			);
		}

		// Apply payment status filter
		if (this.paymentStatusFilter) {
			filtered = filtered.filter(
				(order) => order.paymentStatus === this.paymentStatusFilter
			);
		}

		// Apply order type filter
		if (this.orderTypeFilter) {
			filtered = filtered.filter((order) => order.orderType === this.orderTypeFilter);
		}

		// Apply customer filter
		if (this.customerFilter) {
			filtered = filtered.filter((order) => order.customerId === this.customerFilter);
		}

		this.filteredOrders = filtered;
	}

	onFilterChange() {
		this.applyFilters();
	}

	clearFilters() {
		this.globalFilter = '';
		this.customerFilter = null;
		this.fulfillmentStatusFilter = null;
		this.paymentStatusFilter = null;
		this.orderTypeFilter = null;
		this.applyFilters();
	}

	viewOrderDetails(order: Order) {
		// Load full order details with relations
		this.loading = true;
		this.orderService.getOrderById(order.id).subscribe({
			next: (fullOrder) => {
				this.selectedOrder = fullOrder;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				// Fallback to basic order if full load fails
				this.selectedOrder = order;
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	closeOrderDetails() {
		this.selectedOrder = null;
	}

	openPlaceOrderDialog() {
		const ref = this.dialogService.open(AdminPlaceOrderComponent, {
			header: 'Place New Order',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		ref.onClose.subscribe((order: any) => {
			if (order) {
				this.loadOrdersByMonth();
			}
		});
	}

	// Fulfillment Status Management
	openFulfillmentDialog(order: Order) {
		if (
			order.fulfillmentStatus === FulfillmentStatus.DELIVERED ||
			order.fulfillmentStatus === FulfillmentStatus.CANCELED
		) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Cannot update delivered or canceled orders',
			});
			return;
		}

		this.selectedOrderForAction = order;
		this.selectedFulfillmentStatus = null;
		this.actionNotes = '';
		this.showFulfillmentDialog = true;
	}

	updateFulfillmentStatus() {
		if (!this.selectedOrderForAction || !this.selectedFulfillmentStatus) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select a fulfillment status',
			});
			return;
		}

		const updateData: UpdateFulfillmentStatusDto = {
			fulfillmentStatus: this.selectedFulfillmentStatus,
			internalNotes: this.actionNotes?.trim() || undefined,
		};

		this.orderService.updateFulfillmentStatus(this.selectedOrderForAction.id, updateData).subscribe({
			next: () => {
				const orderId = this.selectedOrderForAction!.id;
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Fulfillment status updated successfully',
				});
				this.showFulfillmentDialog = false;
				this.selectedOrderForAction = null;
				this.loadOrdersByMonth();
				if (this.selectedOrder?.id === orderId) {
					// Reload the selected order to get updated status
					this.orderService.getOrderById(orderId).subscribe({
						next: (updatedOrder) => {
							this.selectedOrder = updatedOrder;
						},
					});
				}
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to update fulfillment status',
				});
			},
		});
	}

	// Payment Status Management
	openPaymentDialog(order: Order) {
		if (order.paymentStatus === PaymentStatus.PAID) {
			this.messageService.add({
				severity: 'info',
				summary: 'Info',
				detail: 'Payment has already been received for this order',
			});
			return;
		}

		this.selectedOrderForAction = order;
		this.selectedPaymentStatus = PaymentStatus.PAID;
		this.selectedPaymentMethod = null;
		this.transactionId = '';
		this.actionNotes = '';
		this.showPaymentDialog = true;
	}

	updatePaymentStatus() {
		if (!this.selectedOrderForAction || !this.selectedPaymentStatus) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation',
				detail: 'Please select a payment status',
			});
			return;
		}

		const updateData: UpdatePaymentStatusDto = {
			paymentStatus: this.selectedPaymentStatus,
			paymentMethod: this.selectedPaymentMethod || undefined,
			transactionId: this.transactionId?.trim() || undefined,
			internalNotes: this.actionNotes?.trim() || undefined,
		};

		this.orderService.updatePaymentStatus(this.selectedOrderForAction.id, updateData).subscribe({
			next: () => {
				const orderId = this.selectedOrderForAction!.id;
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Payment status updated successfully',
				});
				this.showPaymentDialog = false;
				this.selectedOrderForAction = null;
				this.loadOrdersByMonth();
				if (this.selectedOrder?.id === orderId) {
					// Reload the selected order to get updated status
					this.orderService.getOrderById(orderId).subscribe({
						next: (updatedOrder) => {
							this.selectedOrder = updatedOrder;
						},
					});
				}
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to update payment status',
				});
			},
		});
	}

	// Deliver Order
	openDeliverDialog(order: Order) {
		if (order.fulfillmentStatus !== FulfillmentStatus.SHIPPING) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Only orders in shipping status can be marked as delivered',
			});
			return;
		}

		this.selectedOrderForAction = order;
		this.showDeliverDialog = true;
	}

		deliverOrder() {
		if (!this.selectedOrderForAction) return;

		this.orderService.markOrderAsDelivered(this.selectedOrderForAction.id).subscribe({
		next: () => {
			const orderId = this.selectedOrderForAction!.id;
			this.messageService.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Order marked as delivered successfully',
			});
			this.showDeliverDialog = false;
			this.selectedOrderForAction = null;
			this.loadOrdersByMonth();
			if (this.selectedOrder?.id === orderId) {
				// Reload the selected order to get updated status
				this.orderService.getOrderById(orderId).subscribe({
					next: (updatedOrder) => {
						this.selectedOrder = updatedOrder;
					},
				});
			}
		},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to mark order as delivered',
				});
			},
		});
	}

	// Cancel Order
	openCancelDialog(order: Order) {
		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Cannot cancel delivered orders',
			});
			return;
		}

		this.selectedOrderForAction = order;
		this.actionNotes = '';
		this.showCancelDialog = true;
	}

	cancelOrder() {
		if (!this.selectedOrderForAction) return;

		const cancelData: CancelOrderDto = {
			reason: this.actionNotes?.trim() || undefined,
			internalNotes: this.actionNotes?.trim() || undefined,
		};

		this.orderService.cancelOrder(this.selectedOrderForAction.id, cancelData).subscribe({
		next: () => {
			const orderId = this.selectedOrderForAction!.id;
			this.messageService.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Order cancelled successfully',
			});
			this.showCancelDialog = false;
			this.selectedOrderForAction = null;
			this.loadOrdersByMonth();
			if (this.selectedOrder?.id === orderId) {
				// Reload the selected order to get updated status
				this.orderService.getOrderById(orderId).subscribe({
					next: (updatedOrder) => {
						this.selectedOrder = updatedOrder;
					},
				});
			}
		},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to cancel order',
				});
			},
		});
	}

	// Helper Methods
	getStatusSeverity(status: FulfillmentStatus): string {
		switch (status) {
			case FulfillmentStatus.PLACED:
				return 'secondary';
			case FulfillmentStatus.CONFIRMED:
				return 'info';
			case FulfillmentStatus.PROCESSING:
				return 'warning';
			case FulfillmentStatus.SHIPPING:
				return 'info';
			case FulfillmentStatus.DELIVERED:
				return 'success';
			case FulfillmentStatus.CANCELED:
				return 'danger';
			default:
				return 'secondary';
		}
	}

	getPaymentStatusSeverity(status: PaymentStatus): string {
		switch (status) {
			case PaymentStatus.PENDING:
				return 'warning';
			case PaymentStatus.PAID:
				return 'success';
			case PaymentStatus.FAILED:
				return 'danger';
			default:
				return 'secondary';
		}
	}

	formatCurrency(value: number | null | undefined): string {
		const numValue = value && !isNaN(value) && isFinite(value) ? value : 0;
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(numValue)}`;
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	getNextFulfillmentStatus(current: FulfillmentStatus): FulfillmentStatus | null {
		switch (current) {
			case FulfillmentStatus.PLACED:
				return FulfillmentStatus.CONFIRMED;
			case FulfillmentStatus.CONFIRMED:
				return FulfillmentStatus.PROCESSING;
			case FulfillmentStatus.PROCESSING:
				return FulfillmentStatus.SHIPPING;
			case FulfillmentStatus.SHIPPING:
				return FulfillmentStatus.DELIVERED;
			default:
				return null;
		}
	}

	canUpdateFulfillment(order: Order): boolean {
		return (
			order.fulfillmentStatus !== FulfillmentStatus.DELIVERED &&
			order.fulfillmentStatus !== FulfillmentStatus.CANCELED
		);
	}

	canUpdatePayment(order: Order): boolean {
		return order.paymentStatus !== PaymentStatus.PAID;
	}

	canDeliver(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.SHIPPING;
	}

	canCancel(order: Order): boolean {
		return order.fulfillmentStatus !== FulfillmentStatus.DELIVERED;
	}

	// Action Menu Methods
	public setActionMenu(orderId: number, menu: TieredMenu): void {
		this.actionMenus.set(orderId, menu);
	}

	public toggleActionMenu(event: Event, orderId: number): void {
		event.stopPropagation();
		const menuRef = this.actionMenus.get(orderId);
		if (menuRef) {
			menuRef.toggle(event);
		} else {
			const menuIndex = this.filteredOrders.findIndex(o => o.id === orderId);
			if (menuIndex >= 0 && this.actionMenuList && this.actionMenuList.length > menuIndex) {
				const foundMenu = this.actionMenuList.toArray()[menuIndex];
				if (foundMenu) {
					this.actionMenus.set(orderId, foundMenu);
					foundMenu.toggle(event);
				}
			}
		}
	}

	public getActionMenuItems(order: Order): any[] {
		const items: any[] = [
			{
				label: 'View Details',
				icon: 'pi pi-eye',
				command: () => {
					this.viewOrderDetails(order);
				},
			},
		];

		if (this.canUpdateFulfillment(order)) {
			items.push({
				label: 'Update Fulfillment',
				icon: 'pi pi-box',
				command: () => {
					this.openFulfillmentDialog(order);
				},
			});
		}

		if (this.canUpdatePayment(order)) {
			items.push({
				label: 'Update Payment',
				icon: 'pi pi-money-bill',
				command: () => {
					this.openPaymentDialog(order);
				},
			});
		}

		if (this.canDeliver(order)) {
			items.push({
				label: 'Mark as Delivered',
				icon: 'pi pi-check-circle',
				command: () => {
					this.openDeliverDialog(order);
				},
			});
		}

		if (this.canCancel(order)) {
			items.push({
				separator: true,
			});
			items.push({
				label: 'Cancel Order',
				icon: 'pi pi-times-circle',
				command: () => {
					this.openCancelDialog(order);
				},
			});
		}

		return items;
	}

	// View Invoice/Receipt
	viewInvoice(order: Order) {
		const ref = this.dialogService.open(AdminViewInvoiceComponent, {
			header: `Invoice - ${order.orderNumber}`,
			width: '90%',
			style: { 'max-width': '1000px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				orderId: order.id,
				order: order,
			},
		});
	}

	viewReceipt(order: Order) {
		const ref = this.dialogService.open(AdminViewReceiptComponent, {
			header: `Receipt - ${order.orderNumber}`,
			width: '90%',
			style: { 'max-width': '1000px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				orderId: order.id,
				order: order,
			},
		});
	}
}

