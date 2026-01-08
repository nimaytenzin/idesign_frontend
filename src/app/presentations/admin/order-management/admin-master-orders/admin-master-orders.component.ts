import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { CustomerService } from '../../../../core/dataservice/customer/customer.service';
import { Order, FulfillmentStatus, PaymentStatus, OrderQueryDto, ProcessPaymentDto, CancelOrderDto, DeliverOrderDto, UpdateFulfillmentStatusDto } from '../../../../core/dataservice/order/order.interface';
import { Customer } from '../../../../core/dataservice/customer/customer.interface';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { AdminPlaceOrderComponent } from '../admin-place-order/admin-place-order.component';
import { AdminViewOrderComponent } from '../admin-view-order/admin-view-order.component';
import { AdminEditOrderComponent } from '../admin-edit-order/admin-edit-order.component';
import { AdminViewReceiptComponent } from '../admin-view-receipt/admin-view-receipt.component';
import { AdminReceivePaymentComponent } from '../admin-receive-payment/admin-receive-payment.component';

interface MonthlyStats {
	month: string;
	year: number;
	totalOrders: number;
	fulfilledOrders: number;
	cancelledOrders: number;
	salesValue: number;
}

@Component({
	selector: 'app-admin-master-orders',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, DialogService, ConfirmationService],
	templateUrl: './admin-master-orders.component.html',
	styleUrls: ['./admin-master-orders.component.scss'],
})
export class AdminMasterOrdersComponent implements OnInit {
	FulfillmentStatus = FulfillmentStatus; // Expose enum to template
	PaymentStatus = PaymentStatus; // Expose enum to template
	
	orders: Order[] = [];
	filteredOrders: Order[] = [];
	loading: boolean = false;
	globalFilter: string = '';

	// Process Order Dialog
	showProcessDialog: boolean = false;
	selectedOrderForProcessing: Order | null = null;
	selectedFulfillmentStatus: FulfillmentStatus | null = null;

	// Mark as Delivered Dialog
	showDeliverDialog: boolean = false;
	selectedOrderForDelivery: Order | null = null;
	deliverInternalNotes: string = '';

	// Filters
	customerFilter: number | null = null;
	statusFilter: FulfillmentStatus | null = null;
	paymentStatusFilter: PaymentStatus | null = null;
	customers: Customer[] = [];

	// Monthly Statistics
	monthlyStats: MonthlyStats[] = [];
	selectedMonth: string = '';
	selectedYear: number = new Date().getFullYear();
	selectedMonthNumber: number = new Date().getMonth() + 1; // getMonth() returns 0-11, API expects 1-12
	selectedDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
	availableMonths: { label: string; value: string }[] = [];
	monthlyStatistics: any = null;

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
		// Initialize with current month (first day of month)
		const now = new Date();
		this.selectedDate = new Date(now.getFullYear(), now.getMonth(), 1);
		this.selectedYear = now.getFullYear();
		this.selectedMonthNumber = now.getMonth() + 1; // getMonth() returns 0-11, API expects 1-12
		this.selectedMonth = this.selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
		this.loadOrdersByMonth();
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
		const month = this.selectedMonthNumber;

		// Load orders and statistics in parallel
		this.orderService.getOrdersByMonth(year, month).subscribe({
			next: (data) => {
				this.orders = data.orders || [];
				this.selectedMonth = new Date(year, month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
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
				this.updateMonthlyStatsFromAPI(data);
				this.cdr.markForCheck();
			},
			error: () => {
				// Silently fail for statistics, orders are more important
				console.error('Failed to load monthly statistics');
			},
		});
	}

	updateMonthlyStatsFromAPI(apiStats: any) {
		// Update monthly stats from API response
		const monthLabel = new Date(apiStats.year, apiStats.month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
		
		// Find or create stats entry
		let stats = this.monthlyStats.find(s => s.month === monthLabel);
		if (!stats) {
			stats = {
				month: monthLabel,
				year: apiStats.year,
				totalOrders: 0,
				fulfilledOrders: 0,
				cancelledOrders: 0,
				salesValue: 0,
			};
			this.monthlyStats.push(stats);
		}

		// Update from API data
		stats.totalOrders = apiStats.totalOrders || 0;
		stats.fulfilledOrders = apiStats.completedOrders || 0;
		stats.cancelledOrders = apiStats.cancelledOrders || 0;
		stats.salesValue = apiStats.completedRevenue || 0;

		// Sort and update available months
		this.monthlyStats.sort((a, b) => {
			if (a.year !== b.year) return b.year - a.year;
			return b.month.localeCompare(a.month);
		});

		this.availableMonths = this.monthlyStats.map((stat) => ({
			label: stat.month,
			value: stat.month,
		}));
	}

	// Removed calculateMonthlyStats - now using API statistics

	getCurrentMonthStats(): MonthlyStats | null {
		// Use API statistics if available
		if (this.monthlyStatistics) {
			return {
				month: this.selectedMonth,
				year: this.monthlyStatistics.year,
				totalOrders: this.monthlyStatistics.totalOrders || 0,
				fulfilledOrders: this.monthlyStatistics.completedOrders || 0,
				cancelledOrders: this.monthlyStatistics.cancelledOrders || 0,
				salesValue: this.monthlyStatistics.completedRevenue || 0,
			};
		}
		
		// Fallback to calculated stats
		if (!this.selectedMonth || this.monthlyStats.length === 0) return null;
		const stats = this.monthlyStats.find((stat) => stat.month === this.selectedMonth);
		if (stats) {
			// Ensure salesValue is a valid number
			if (isNaN(stats.salesValue) || !isFinite(stats.salesValue)) {
				stats.salesValue = 0;
			}
			return stats;
		}
		return null;
	}

	applyFilters() {
		let filtered = [...this.orders];

		// Apply global search filter (client-side only)
		if (this.globalFilter) {
			const search = this.globalFilter.toLowerCase();
			filtered = filtered.filter(
				(o) =>
					o.orderNumber?.toLowerCase().includes(search) ||
					o.customer?.name?.toLowerCase().includes(search) ||
					o.customer?.email?.toLowerCase().includes(search)
			);
		}

		// Apply fulfillment status filter (client-side only)
		if (this.statusFilter) {
			filtered = filtered.filter((order) => order.fulfillmentStatus === this.statusFilter);
		}

		// Apply payment status filter (client-side only)
		if (this.paymentStatusFilter) {
			filtered = filtered.filter((order) => order.paymentStatus === this.paymentStatusFilter);
		}

		// Apply customer filter (client-side only)
		if (this.customerFilter) {
			filtered = filtered.filter((order) => order.customerId === this.customerFilter);
		}

		this.filteredOrders = filtered;
	}

	onFilterChange() {
		// Client-side filtering only - no API call
		this.applyFilters();
	}

	onMonthChange() {
		if (this.selectedDate) {
			this.selectedYear = this.selectedDate.getFullYear();
			this.selectedMonthNumber = this.selectedDate.getMonth() + 1; // getMonth() returns 0-11, API expects 1-12
			this.selectedMonth = this.selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
			this.loadOrdersByMonth();
		}
	}

	clearFilters() {
		this.globalFilter = '';
		this.customerFilter = null;
		this.statusFilter = null;
		this.paymentStatusFilter = null;
		// Keep current month selected, just clear other filters
		this.applyFilters();
	}

	viewOrder(order: Order) {
		const ref = this.dialogService.open(AdminViewOrderComponent, {
			header: 'Order Details',
			style: { 'max-width': '1200px' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { order: order },
		});
	}

	editOrder(order: Order) {
		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED || order.fulfillmentStatus === FulfillmentStatus.CANCELED) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Cannot edit delivered or canceled orders',
			});
			return;
		}
		
		const ref = this.dialogService.open(AdminEditOrderComponent, {
			header: 'Edit Order',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { order: order },
		});

		ref.onClose.subscribe((updated: any) => {
			if (updated) {
				this.loadOrdersByMonth();
			}
		});
	}

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

	cancelOrder(order: Order) {
		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Cannot cancel delivered orders',
			});
			return;
		}

		if (order.fulfillmentStatus === FulfillmentStatus.CANCELED) {
			this.messageService.add({
				severity: 'info',
				summary: 'Info',
				detail: 'Order is already canceled',
			});
			return;
		}

		this.confirmationService.confirm({
			message: `Are you sure you want to cancel order ${order.orderNumber}?`,
			header: 'Cancel Order',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				const cancelData: CancelOrderDto = {};
				this.orderService.cancelOrder(order.id, cancelData).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Order cancelled successfully',
						});
						this.loadOrdersByMonth();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to cancel order',
						});
					},
				});
			},
		});
	}

	receivePayment(order: Order) {
		if (order.paymentStatus === PaymentStatus.PAID) {
			this.messageService.add({
				severity: 'info',
				summary: 'Info',
				detail: 'Payment has already been received for this order',
			});
			return;
		}

		const ref = this.dialogService.open(AdminReceivePaymentComponent, {
			header: 'Receive Payment',
			width: '500px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { order: order },
		});

		ref.onClose.subscribe((success: any) => {
			if (success) {
				this.loadOrdersByMonth();
			}
		});
	}

	deleteOrder(order: Order) {
		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED || order.paymentStatus === PaymentStatus.PAID) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Cannot delete delivered orders or orders with paid status',
			});
			return;
		}

		this.confirmationService.confirm({
			message: `Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`,
			header: 'Delete Order',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.orderService.deleteOrder(order.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Order deleted successfully',
						});
						this.loadOrdersByMonth();
					},
					error: (error) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete order',
						});
					},
				});
			},
		});
	}

	isOrderCompleted(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.DELIVERED;
	}

	isOrderCanceled(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.CANCELED;
	}

	isOrderPaid(order: Order): boolean {
		return order.paymentStatus === PaymentStatus.PAID;
	}

	viewReceipt(order: Order) {
		
		if (!order.receiptNumber) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Receipt not generated for this order',
			});
			return;
		}

		// Load full order details to ensure all data is available
		this.orderService.getOrderById(order.id).subscribe({
			next: (fullOrder) => {

				const ref = this.dialogService.open(AdminViewReceiptComponent, {
					header: 'View Receipt',
					width: '90%',
					style: { 'max-width': '1000px' },
					baseZIndex: 10000,
					modal: true,
					dismissableMask: true,
					data: { order: fullOrder },
				});

				ref.onClose.subscribe(() => {
					console.log('Receipt dialog closed');
				});
			},
			error: (error) => {
				console.error('Error loading order:', error);
				// If loading fails, try with existing order data
				const ref = this.dialogService.open(AdminViewReceiptComponent, {
					header: 'View Receipt',
					width: '90%',
					style: { 'max-width': '1000px' },
					contentStyle: { overflow: 'auto', 'max-height': '90vh' },
					baseZIndex: 10000,
					modal: true,
					dismissableMask: true,
					data: { order: order },
				});

				ref.onClose.subscribe(() => {
					console.log('Receipt dialog closed (fallback)');
				});
			},
		});
	}

	getAvailableYears(): number[] {
		const currentYear = new Date().getFullYear();
		return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
	}

	getAvailableMonths(): { value: number; label: string }[] {
		return [
			{ value: 1, label: 'January' },
			{ value: 2, label: 'February' },
			{ value: 3, label: 'March' },
			{ value: 4, label: 'April' },
			{ value: 5, label: 'May' },
			{ value: 6, label: 'June' },
			{ value: 7, label: 'July' },
			{ value: 8, label: 'August' },
			{ value: 9, label: 'September' },
			{ value: 10, label: 'October' },
			{ value: 11, label: 'November' },
			{ value: 12, label: 'December' },
		];
	}

	// Workflow Processing Methods
	canProcessToProcessing(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.CONFIRMED && 
			   order.paymentStatus === PaymentStatus.PAID;
	}

	canProcessToShipping(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.PROCESSING;
	}

	canProcessToDelivered(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.SHIPPING;
	}

	canProcessOrder(order: Order): boolean {
		// Allow processing any order that is not DELIVERED or CANCELED
		return order.fulfillmentStatus !== FulfillmentStatus.DELIVERED &&
			   order.fulfillmentStatus !== FulfillmentStatus.CANCELED;
	}

	getNextWorkflowAction(order: Order): { label: string; status: FulfillmentStatus; icon: string } | null {
		if (this.canProcessToProcessing(order)) {
			return { label: 'Start Processing', status: FulfillmentStatus.PROCESSING, icon: 'pi pi-cog' };
		}
		if (this.canProcessToShipping(order)) {
			return { label: 'Mark as Shipping', status: FulfillmentStatus.SHIPPING, icon: 'pi pi-send' };
		}
		if (this.canProcessToDelivered(order)) {
			return { label: 'Mark as Delivered', status: FulfillmentStatus.DELIVERED, icon: 'pi pi-check-circle' };
		}
		return null;
	}

	processToProcessing(order: Order) {
		this.updateFulfillmentStatus(order, FulfillmentStatus.PROCESSING, 'Order moved to processing stage');
	}

	processToShipping(order: Order) {
		this.updateFulfillmentStatus(order, FulfillmentStatus.SHIPPING, 'Order marked as shipping');
	}

	processToDelivered(order: Order) {
		this.confirmationService.confirm({
			message: `Mark order ${order.orderNumber} as DELIVERED? This will send a thank you message to the customer and increment product sales counts.`,
			header: 'Confirm Delivery',
			icon: 'pi pi-check-circle',
			acceptButtonStyleClass: 'p-button-success',
			accept: () => {
				this.updateFulfillmentStatus(order, FulfillmentStatus.DELIVERED, 'Order delivered - thank you message sent to customer');
			},
		});
	}

	processNextStep(order: Order) {
		const nextAction = this.getNextWorkflowAction(order);
		if (!nextAction) return;

		switch (nextAction.status) {
			case FulfillmentStatus.PROCESSING:
				this.processToProcessing(order);
				break;
			case FulfillmentStatus.SHIPPING:
				this.processToShipping(order);
				break;
			case FulfillmentStatus.DELIVERED:
				this.processToDelivered(order);
				break;
		}
	}

	private updateFulfillmentStatus(order: Order, status: FulfillmentStatus, successMessage: string) {
		const updateData: UpdateFulfillmentStatusDto = {
			fulfillmentStatus: status,
		};

		this.orderService.updateFulfillmentStatus(order.id, updateData).subscribe({
			next: (updatedOrder) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Status Updated',
					detail: successMessage,
					life: 5000,
				});
				this.loadOrdersByMonth();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Update Failed',
					detail: error.error?.message || 'Failed to update order status',
					life: 5000,
				});
			},
		});
	}

	getWorkflowTooltip(order: Order): string {
		if (order.fulfillmentStatus === FulfillmentStatus.PLACED) {
			return 'Order is placed. Waiting for payment confirmation.';
		}
		if (order.fulfillmentStatus === FulfillmentStatus.CONFIRMED) {
			if (order.paymentStatus === PaymentStatus.PAID) {
				return 'Order confirmed and paid. Ready to process.';
			}
			return 'Order confirmed. Waiting for payment.';
		}
		if (order.fulfillmentStatus === FulfillmentStatus.PROCESSING) {
			return 'Order is being processed. Next: Shipping.';
		}
		if (order.fulfillmentStatus === FulfillmentStatus.SHIPPING) {
			return 'Order is being shipped. Next: Delivery.';
		}
		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED) {
			return 'Order has been delivered. Thank you message sent.';
		}
		if (order.fulfillmentStatus === FulfillmentStatus.CANCELED) {
			return 'Order has been canceled.';
		}
		return 'Order status information';
	}

	getOrdersReadyForProcessing(): number {
		return this.filteredOrders.filter(order => this.canProcessOrder(order)).length;
	}

	hasOrdersReadyForProcessing(): boolean {
		return this.getOrdersReadyForProcessing() > 0;
	}

	getAllFulfillmentStatusOptions(): { label: string; value: FulfillmentStatus; icon: string }[] {
		return [
			{ label: 'Placed', value: FulfillmentStatus.PLACED, icon: 'pi pi-clock' },
			{ label: 'Confirmed', value: FulfillmentStatus.CONFIRMED, icon: 'pi pi-check' },
			{ label: 'Processing', value: FulfillmentStatus.PROCESSING, icon: 'pi pi-cog' },
			{ label: 'Shipping', value: FulfillmentStatus.SHIPPING, icon: 'pi pi-send' },
			{ label: 'Delivered', value: FulfillmentStatus.DELIVERED, icon: 'pi pi-check-circle' },
		];
	}

	getAvailableStatusOptions(order: Order): { label: string; value: FulfillmentStatus; icon: string; enabled: boolean }[] {
		// Return all statuses except CANCELED (handled separately) and current status
		const allStatuses = this.getAllFulfillmentStatusOptions();
		return allStatuses
			.filter(status => status.value !== order.fulfillmentStatus && status.value !== FulfillmentStatus.CANCELED)
			.map(status => ({ ...status, enabled: true }));
	}

	getProcessDialogStatusOptions(): { label: string; value: FulfillmentStatus; icon: string }[] {
		// Return all statuses except CANCELED for the dialog dropdown
		// Current status will be filtered in the template if needed
		return this.getAllFulfillmentStatusOptions()
			.filter(status => status.value !== FulfillmentStatus.CANCELED);
	}

	openProcessDialog(order: Order) {
		this.selectedOrderForProcessing = order;
		this.selectedFulfillmentStatus = null;
		this.showProcessDialog = true;
	}

	closeProcessDialog() {
		this.showProcessDialog = false;
		this.selectedOrderForProcessing = null;
		this.selectedFulfillmentStatus = null;
	}

	confirmProcessOrder() {
		if (!this.selectedOrderForProcessing || !this.selectedFulfillmentStatus) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please select a fulfillment status',
			});
			return;
		}

		// Check if status is changing
		if (this.selectedOrderForProcessing.fulfillmentStatus === this.selectedFulfillmentStatus) {
			this.messageService.add({
				severity: 'info',
				summary: 'No Change',
				detail: 'Order is already in the selected status',
			});
			this.closeProcessDialog();
			return;
		}

		// Special handling for DELIVERED status
		if (this.selectedFulfillmentStatus === FulfillmentStatus.DELIVERED) {
			this.confirmationService.confirm({
				message: `Mark order ${this.selectedOrderForProcessing.orderNumber} as DELIVERED? This will send a thank you message to the customer and increment product sales counts.`,
				header: 'Confirm Delivery',
				icon: 'pi pi-check-circle',
				acceptButtonStyleClass: 'p-button-success',
				accept: () => {
					this.processOrderWithStatus(this.selectedOrderForProcessing!, this.selectedFulfillmentStatus!);
					this.closeProcessDialog();
				},
			});
		} else {
			this.processOrderWithStatus(this.selectedOrderForProcessing, this.selectedFulfillmentStatus);
			this.closeProcessDialog();
		}
	}

	onProcessButtonClick(order: Order) {
		this.openProcessDialog(order);
	}

	processOrderWithStatus(order: Order, status: FulfillmentStatus) {
		if (!status) return;

		let message = '';
		switch (status) {
			case FulfillmentStatus.PROCESSING:
				message = 'Order moved to processing stage';
				break;
			case FulfillmentStatus.SHIPPING:
				message = 'Order marked as shipping';
				break;
			case FulfillmentStatus.DELIVERED:
				// Show confirmation dialog for delivery
				this.confirmationService.confirm({
					message: `Mark order ${order.orderNumber} as DELIVERED? This will send a thank you message to the customer and increment product sales counts.`,
					header: 'Confirm Delivery',
					icon: 'pi pi-check-circle',
					acceptButtonStyleClass: 'p-button-success',
					accept: () => {
						message = 'Order delivered - thank you message sent to customer';
						this.updateFulfillmentStatus(order, status, message);
					},
				});
				return; // Early return since confirmation dialog handles the update
		}

		this.updateFulfillmentStatus(order, status, message);
	}

	// Mark as Delivered Methods
	canMarkAsDelivered(order: Order): boolean {
		return order.fulfillmentStatus !== FulfillmentStatus.DELIVERED;
	}

	openDeliverDialog(order: Order) {
		if (!this.canMarkAsDelivered(order)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Only CONFIRMED orders can be marked as delivered',
			});
			return;
		}

		this.selectedOrderForDelivery = order;
		this.deliverInternalNotes = '';
		this.showDeliverDialog = true;
	}

	closeDeliverDialog() {
		this.showDeliverDialog = false;
		this.selectedOrderForDelivery = null;
		this.deliverInternalNotes = '';
	}

	confirmMarkAsDelivered() {
		if (!this.selectedOrderForDelivery) {
			return;
		}

		const deliverData: DeliverOrderDto = {
			internalNotes: this.deliverInternalNotes?.trim() || undefined,
		};

		this.orderService.markOrderAsDelivered(this.selectedOrderForDelivery.id, deliverData).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Order marked as delivered successfully. Thank you message sent to customer.',
					life: 5000,
				});
				this.closeDeliverDialog();
				this.loadOrdersByMonth();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to mark order as delivered',
					life: 5000,
				});
			},
		});
	}
}

