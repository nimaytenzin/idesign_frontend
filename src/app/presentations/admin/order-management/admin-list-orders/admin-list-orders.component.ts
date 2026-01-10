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
import { AdminViewOrderComponent } from '../admin-view-order/admin-view-order.component';
import { AdminConfirmOrderComponent } from '../admin-confirm-order/admin-confirm-order.component';
import { AdminShipOrderComponent } from '../admin-ship-order/admin-ship-order.component';
import { AdminDeliverOrderComponent } from '../admin-deliver-order/admin-deliver-order.component';
import { FulfillmentStatus, OrderSource, PaymentStatus, FulfillmentType } from '../../../../core/constants/enums';

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
	OrderSource = OrderSource;
	FulfillmentType = FulfillmentType;

	// Action menu references
	public actionMenus: Map<number, TieredMenu> = new Map();

	orders: Order[] = [];
	filteredOrders: Order[] = [];
	loading: boolean = false;
	globalFilter: string = '';

	// Tab management
	activeTabIndex: number = 0;
	tabs = [
		{ label: 'To Confirm', status: FulfillmentStatus.PLACED, action: 'Confirm Order' },
		{ label: 'To Deliver', status: FulfillmentStatus.PROCESSING, action: 'Deliver Order' },
		{ label: 'To Track', status: FulfillmentStatus.SHIPPING, action: 'Mark as Delivered' },
		{ label: 'Delivered Orders', status: FulfillmentStatus.DELIVERED, action: 'View' },
		{ label: 'Canceled Orders', status: FulfillmentStatus.CANCELED, action: 'View' },
	];

	// Pagination state per tab
	paginationState: Map<FulfillmentStatus, { page: number; limit: number; total: number; totalPages: number }> = new Map();

	// Filters
	customerFilter: number | null = null;
	fulfillmentStatusFilter: FulfillmentStatus | null = null;
	paymentStatusFilter: PaymentStatus | null = null;
	orderTypeFilter: OrderSource | null = null;
	customers: Customer[] = [];

	// Monthly Statistics
	selectedYear: number = new Date().getFullYear();
	selectedMonth: number = new Date().getMonth() + 1;
	selectedDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
	monthlyStatistics: OrderStatisticsByMonthResponseDto | null = null;

	// Status update dialogs
	showFulfillmentDialog: boolean = false;
	showPaymentDialog: boolean = false;
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
		{ label: 'Counter', value: OrderSource.COUNTER },
		{ label: 'Online', value: OrderSource.ONLINE },
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
		this.loadOrderStatistics();
		this.loadOrdersForTab(this.activeTabIndex);
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

	getTabLabel(status: FulfillmentStatus): string {
		const tab = this.tabs.find(t => t.status === status);
		return tab?.label || status;
	}

	loadOrderStatistics() {
		const year = this.selectedYear;
		const month = this.selectedMonth;

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

	loadOrdersForTab(tabIndex: number) {
		if (tabIndex < 0 || tabIndex >= this.tabs.length) return;

		const tab = this.tabs[tabIndex];
		const status = tab.status;
		
		// Get pagination state for this tab
		const pagination = this.paginationState.get(status) || { page: 1, limit: 25, total: 0, totalPages: 0 };

		this.loading = true;
		this.orderService.getOrdersPaginated({
			page: pagination.page,
			limit: pagination.limit,
			fulfillmentStatus: status,
		}).subscribe({
			next: (data) => {
				this.orders = data.data || [];
				this.filteredOrders = this.orders;
				
				// Update pagination state
				this.paginationState.set(status, {
					page: data.meta.page,
					limit: data.meta.limit,
					total: data.meta.total,
					totalPages: data.meta.totalPages,
				});

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
	}

	onTabChange(event: any) {
		this.activeTabIndex = event.index;
		this.loadOrdersForTab(this.activeTabIndex);
	}

	onPageChange(event: any) {
		const tab = this.tabs[this.activeTabIndex];
		const status = tab.status;
		
		// Update pagination state
		// PrimeNG paginator: event.page is 0-based, event.rows is the limit
		const pagination = this.paginationState.get(status) || { page: 1, limit: 25, total: 0, totalPages: 0 };
		pagination.page = (event.page ?? 0) + 1; // Convert 0-based to 1-based
		pagination.limit = event.rows || 25;
		
		this.paginationState.set(status, pagination);
		this.loadOrdersForTab(this.activeTabIndex);
	}

	getCurrentPagination() {
		const tab = this.tabs[this.activeTabIndex];
		const status = tab.status;
		return this.paginationState.get(status) || { page: 1, limit: 25, total: 0, totalPages: 0 };
	}

	onMonthChange() {
		if (this.selectedDate) {
			this.selectedYear = this.selectedDate.getFullYear();
			this.selectedMonth = this.selectedDate.getMonth() + 1;
			this.loadOrderStatistics();
			// Reset pagination and reload current tab
			this.paginationState.clear();
			this.loadOrdersForTab(this.activeTabIndex);
		}
	}

	applyFilters() {
		let filtered = [...this.orders];

		
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
		// Open order details in a dialog
		const ref = this.dialogService.open(AdminViewOrderComponent, {
			header: `Order Details - ${order.orderNumber}`,
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				orderId: order.id,
				order: order,
			},
		});

		ref.onClose.subscribe(() => {
			// Reload orders after closing dialog if needed
			this.loadOrdersForTab(this.activeTabIndex);
		});
	}


	openPlaceOrderDialog() {
		const ref = this.dialogService.open(AdminPlaceOrderComponent, {
			header: 'Place New Order',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: false,
		});

		ref.onClose.subscribe((order: any) => {
			if (order) {
				this.loadOrdersForTab(this.activeTabIndex);
			}
		});
	}
 
	deliverOrder(order: Order) {
		// Open deliver order dialog
		const ref = this.dialogService.open(AdminDeliverOrderComponent, {
			header: `Mark as Delivered - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: {
				order: order,
				orderId: order.id,
			},
		});

		ref.onClose.subscribe((deliveredOrder) => {
			if (deliveredOrder) {
				this.loadOrdersForTab(this.activeTabIndex);
			}
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
			this.loadOrdersForTab(this.activeTabIndex);
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

	getMonthTitle(): string {
		if (!this.selectedDate) return '';
		return this.selectedDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
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

	canConfirmOrder(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.PLACED;
	}

	canProcessOrder(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.CONFIRMED;
	}

	canShipOrder(order: Order): boolean {
		return order.fulfillmentStatus === FulfillmentStatus.PROCESSING;
	}

	confirmOrder(order: Order) {
		// Open confirm order dialog
		const ref = this.dialogService.open(AdminConfirmOrderComponent, {
			header: `Confirm Order - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: {
				order: order,
				orderId: order.id,
			},
		});

		ref.onClose.subscribe((confirmedOrder) => {
			if (confirmedOrder) {
				this.loadOrdersForTab(this.activeTabIndex);
			}
		});
	}

	shipOrder(order: Order) {
		// Open ship order dialog
		const ref = this.dialogService.open(AdminShipOrderComponent, {
			header: `Ship Order - ${order.orderNumber}`,
			width: '600px',
			modal: true,
			dismissableMask: true,
			data: {
				order: order,
				orderId: order.id,
			},
		});

		ref.onClose.subscribe((shippedOrder) => {
			if (shippedOrder) {
				this.loadOrdersForTab(this.activeTabIndex);
			}
		});
	}

	getActionButtonLabel(order: Order): string {
		const currentTab = this.tabs[this.activeTabIndex];
		if (!currentTab) return '';
		
		switch (order.fulfillmentStatus) {
			case FulfillmentStatus.PLACED:
				return 'Confirm Order';
			case FulfillmentStatus.PROCESSING:
				return 'Ship Order';
			case FulfillmentStatus.SHIPPING:
				return 'Mark as Delivered';
			default:
				return '';
		}
	}

	getActionButtonIcon(order: Order): string {
		const currentTab = this.tabs[this.activeTabIndex];
		if (!currentTab) return '';
		
		switch (order.fulfillmentStatus) {
			case FulfillmentStatus.PLACED:
				return 'pi pi-check';
			case FulfillmentStatus.PROCESSING:
				return 'pi pi-truck';
			case FulfillmentStatus.SHIPPING:
				return 'pi pi-check-circle';
			default:
				return '';
		}
	}

	executeTabAction(order: Order) {
		const currentTab = this.tabs[this.activeTabIndex];
		if (!currentTab) return;

		switch (order.fulfillmentStatus) {
			case FulfillmentStatus.PLACED:
				this.confirmOrder(order);
				break;
			case FulfillmentStatus.PROCESSING:
				this.shipOrder(order);
				break;
			case FulfillmentStatus.SHIPPING:
				this.deliverOrder(order);
				break;
			default:
				break;
		}
	}

	shouldShowTabActionButton(order: Order): boolean {
		const currentTab = this.tabs[this.activeTabIndex];
		if (!currentTab) return false;
		
		return order.fulfillmentStatus === currentTab.status;
	}

	canUpdatePayment(order: Order): boolean {
		return false;
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

	

		if (this.canDeliver(order)) {
			items.push({
				label: 'Mark as Delivered',
				icon: 'pi pi-check-circle',
				command: () => {
					this.deliverOrder(order);
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
			width: '80%',
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

