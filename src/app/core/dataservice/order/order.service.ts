import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Order,
	CreateOrderDto,
	OrderCheckoutResponseDto,
	CounterPayNowPickupLaterDto,
	UpdateOrderDto,
	UpdateOrderStatusDto,
	UpdateFulfillmentStatusDto,
	UpdatePaymentStatusDto,
	ProcessPaymentDto,
	VerifyOrderDto,
	CancelOrderDto,
	MarkConfirmedDto,
	DeliverOrderDto,
	ConfirmOrderDto,
	ShipOrderDto,
	OrderQueryDto,
	GetOrdersPaginatedQueryDto,
	GetOrdersCompletedQueryDto,
	GetOrdersCancelledQueryDto,
	PaginatedResponseDto,
	MonthQueryDto,
	OrdersByMonthResponseDto,
	OrderStatisticsByMonthResponseDto,
	OrderMonthlyReportResponseDto,
	OrderDailyStatsResponseDto,
	ChartOfAccount,
	CreateChartOfAccountDto,
	UpdateChartOfAccountDto,
	Transaction,
	CreateTransactionDto,
	TransactionQueryDto,
	IncomeStatement,
	BalanceSheet,
	TrackOrderDto,
	GetCustomerStatusDto,
	OrderTimelineEvent,
} from './order.interface';
import { RecordOrderPaymentDto, PaymentReceipt } from '../payment-receipt/payment-receipt.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class OrderService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/orders`;

	constructor(private http: HttpClient) {}

	// ==================== Order Management ====================

	/**
	 * Single entry point for online order: create order + initiate payment.
	 * POST /orders/online/checkout
	 * Returns order + paymentInitiation on success; order + paymentFailed + paymentError when order created but payment init failed.
	 * Do not call place-order + initiate-payment separately for the initial flow.
	 */
	createOnlineCheckout(orderData: CreateOrderDto): Observable<OrderCheckoutResponseDto> {
		return this.http.post<OrderCheckoutResponseDto>(`${this.apiUrl}/online/checkout`, orderData);
	}

	/**
	 * Create a new order (legacy – use createOnlineCheckout for online flow)
	 * POST /orders/online/place-order
	 */
	createOnlineOrder(orderData: CreateOrderDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/online/place-order`, orderData);
	}


	/**
	 * POST /orders/instore/place-order
	 * Counter: pay-now. Frontend sends fulfillmentStatus: CONFIRMED. bankAccountId required when paymentMethod is not CASH (MBOB, BDB_EPAY, TPAY, BNB_MPAY, ZPSS); omit for CASH.
	 */
	instorePlaceOrder(orderData: CreateOrderDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/instore/place-order`, orderData);
	}

	

	/**
	 * POST /orders/:id/mark-collected
	 * Mark PICKUP/INSTORE as collected. Preconditions: fulfillmentStatus CONFIRMED or PROCESSING.
	 * Effect: fulfillmentStatus → DELIVERED, deliveredAt = now.
	 */
	markOrderAsCollected(id: number): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/mark-collected`, {});
	}

	/**
	 * POST /orders/:id/mark-confirmed
	 * PLACED → CONFIRMED, sets confirmedAt. Payment unchanged. Body optional (internalNotes).
	 * Backend returns 400 if fulfillmentStatus !== PLACED.
	 */
	markOrderAsConfirmed(id: number, dto?: MarkConfirmedDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/mark-confirmed`, dto ?? {});
	}

	getOrders(query?: OrderQueryDto): Observable<Order[]> {
		let params = new HttpParams();
		if (query) {
			if (query.customerId) params = params.set('customerId', query.customerId.toString());
			if (query.fulfillmentStatus) params = params.set('fulfillmentStatus', query.fulfillmentStatus);
		}
		return this.http.get<Order[]>(`${this.apiUrl}`, { params });
	}
	 


	/**
	 * Get orders paginated by fulfillment status
	 * 
	 * @description Retrieves a paginated list of orders, optionally filtered by fulfillment status.
	 * This endpoint is restricted to ADMIN and STAFF roles only. Orders are returned with full
	 * details including customer information, order items with products, and applied discounts.
	 * Results are ordered by placement date (most recent first).
	 * 
	 * @route GET /orders/paginated
	 * @access Private (Admin, Staff)
	 * 
	 * @query {number} [page=1] - Page number (minimum: 1)
	 * @query {number} [limit=10] - Number of items per page (minimum: 1, maximum: 100)
	 * @query {FulfillmentStatus} [fulfillmentStatus] - Optional filter by fulfillment status
	 *   - PLACED: Order has been placed but not yet confirmed
	 *   - CONFIRMED: Order has been confirmed and is ready for processing
	 *   - PROCESSING: Order is being prepared/processed
	 *   - SHIPPING: Order is out for delivery
	 *   - DELIVERED: Order has been successfully delivered
	 *   - CANCELED: Order has been canceled
	 * 
	 * @returns {PaginatedResponseDto<Order>} Paginated response containing:
	 *   - data: Array of Order objects with customer, orderItems, and orderDiscounts
	 *   - meta: Pagination metadata (total, page, limit, totalPages, hasNextPage, hasPreviousPage)
	 */
	getOrdersPaginated(query?: GetOrdersPaginatedQueryDto): Observable<PaginatedResponseDto<Order>> {
		let params = new HttpParams();
		if (query) {
			if (query.page !== undefined) params = params.set('page', query.page.toString());
			if (query.limit !== undefined) params = params.set('limit', query.limit.toString());
			if (query.fulfillmentStatus) params = params.set('fulfillmentStatus', query.fulfillmentStatus);
			if (query.paymentStatus) params = params.set('paymentStatus', query.paymentStatus);
			if (query.orderSource) params = params.set('orderSource', query.orderSource);
			if (query.fulfillmentType) params = params.set('fulfillmentType', query.fulfillmentType);
			if (query.placedAtFrom) params = params.set('placedAtFrom', query.placedAtFrom);
			if (query.placedAtTo) params = params.set('placedAtTo', query.placedAtTo);
			if (query.deliveredAtFrom) params = params.set('deliveredAtFrom', query.deliveredAtFrom);
			if (query.deliveredAtTo) params = params.set('deliveredAtTo', query.deliveredAtTo);
			if (query.updatedAtFrom) params = params.set('updatedAtFrom', query.updatedAtFrom);
			if (query.updatedAtTo) params = params.set('updatedAtTo', query.updatedAtTo);
		}
		return this.http.get<PaginatedResponseDto<Order>>(`${this.apiUrl}/paginated`, { params });
	}

	// ==================== Unpaginated by status ====================

	/**
	 * Get orders to confirm (PLACED + PENDING). Unpaginated. Includes customer, orderItems (with product), orderDiscounts. Sorted by placedAt desc.
	 */
	getOrdersToConfirm(): Observable<Order[]> {
		return this.http.get<Order[]>(`${this.apiUrl}/to-confirm`);
	}

	/**
	 * Get orders to deliver (SHIPPING). Unpaginated. Includes customer, orderItems (with product), orderDiscounts. Sorted by shippingAt asc, then placedAt desc.
	 */
	getOrdersToDeliver(): Observable<Order[]> {
		return this.http.get<Order[]>(`${this.apiUrl}/to-deliver`);
	}


	// GET Orders for pickup

	getOrdersReadyForPickup(): Observable<Order[]> {
		return this.http.get<Order[]>(`${this.apiUrl}/for-pickup`);
	}

	/**
	 * GET /orders/admin/unpaid-delivery
	 * DELIVERED + (PENDING | PARTIAL). Unpaginated. Sort: deliveredAt DESC, placedAt DESC.
	 */
	getUnpaidDeliveredOrders(): Observable<Order[]> {
		return this.http.get<Order[]>(`${this.apiUrl}/unpaid-delivery`);
	}


	/**
	 * Get orders to track (SHIPPING, in transit). Unpaginated. Includes customer, orderItems (with product), orderDiscounts. Sorted by shippingAt asc, then placedAt desc.
	 */
	getOrdersToTrack(): Observable<Order[]> {
		return this.http.get<Order[]>(`${this.apiUrl}/to-track`);
	}

	// ==================== Admin Workflow & History (GET /orders/admin/...) ====================


	/**
	 * GET /orders/admin/completed
	 * DELIVERED + PAID. Paginated. deliveredAtFrom/To optional; omitted = current month. Sort: deliveredAt DESC.
	 */
	getOrdersAdminCompleted(query?: GetOrdersCompletedQueryDto): Observable<PaginatedResponseDto<Order>> {
		let params = new HttpParams();
		if (query) {
			if (query.page !== undefined) params = params.set('page', query.page.toString());
			if (query.limit !== undefined) params = params.set('limit', query.limit.toString());
			if (query.deliveredAtFrom) params = params.set('deliveredAtFrom', query.deliveredAtFrom);
			if (query.deliveredAtTo) params = params.set('deliveredAtTo', query.deliveredAtTo);
		}
		return this.http.get<PaginatedResponseDto<Order>>(`${this.apiUrl}/admin/completed`, { params });
	}

	/**
	 * GET /orders/admin/cancelled
	 * CANCELED. Paginated. updatedAtFrom/To optional; omitted = current month. Sort: updatedAt DESC.
	 */
	getOrdersAdminCancelled(query?: GetOrdersCancelledQueryDto): Observable<PaginatedResponseDto<Order>> {
		let params = new HttpParams();
		if (query) {
			if (query.page !== undefined) params = params.set('page', query.page.toString());
			if (query.limit !== undefined) params = params.set('limit', query.limit.toString());
			if (query.updatedAtFrom) params = params.set('updatedAtFrom', query.updatedAtFrom);
			if (query.updatedAtTo) params = params.set('updatedAtTo', query.updatedAtTo);
		}
		return this.http.get<PaginatedResponseDto<Order>>(`${this.apiUrl}/admin/cancelled`, { params });
	}

	/**
	 * Get order by ID
	 * Includes: Full order details, Customer information, Order line items with products,
	 * Transactions, customerStatusMessage (customer-friendly status)
	 */
	getOrderById(id: number): Observable<Order> {
		return this.http.get<Order>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update order
	 * Restrictions:
	 * - Cannot update if order is DELIVERED or CANCELED
	 * - Recalculates totalAmount if line items or shipping changed
	 */
	updateOrder(id: number, orderData: UpdateOrderDto): Observable<Order> {
		return this.http.patch<Order>(`${this.apiUrl}/${id}`, orderData);
	}

	/**
	 * Delete order
	 * Restrictions:
	 * - Cannot delete if order is DELIVERED or paymentStatus is PAID
	 */
	deleteOrder(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	// ==================== Order Status Management ====================

	/**
	 * Update order status (combined - can update both fulfillment and payment status)
	 * Validates status transitions
	 * Sets appropriate timestamps
	 * Sends SMS notifications on status changes
	 */
	updateOrderStatus(id: number, statusData: UpdateOrderStatusDto): Observable<Order> {
		return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, statusData);
	}

	/**
	 * Update fulfillment status only
	 * Validates status transitions
	 * Sets appropriate timestamps (confirmedAt, processingAt, shippingAt, etc.)
	 * For SHIPPING status, requires driverName, driverPhone, and vehicleNumber
	 * Increments product salesCount when status is DELIVERED
	 * Sends SMS notifications based on status changes
	 * 
	 * Status Transition Rules:
	 * - PLACED → CONFIRMED, CANCELED
	 * - CONFIRMED → PROCESSING, CANCELED
	 * - PROCESSING → SHIPPING, CANCELED
	 * - SHIPPING → DELIVERED, CANCELED
	 * - DELIVERED → (no transitions)
	 * - CANCELED → (no transitions)
	 */
	updateFulfillmentStatus(id: number, statusData: UpdateFulfillmentStatusDto): Observable<Order> {
		return this.http.patch<Order>(`${this.apiUrl}/${id}/fulfillment-status`, statusData);
	}

	/**
	 * Update payment status only
	 * Sets paidAt timestamp when moving to PAID
	 * Creates accounting transactions when moving to PAID
	 * Generates receipt if not already generated
	 * Sends SMS notification (PLACED_TO_CONFIRMED event)
	 */
	updatePaymentStatus(id: number, statusData: UpdatePaymentStatusDto): Observable<Order> {
		return this.http.patch<Order>(`${this.apiUrl}/${id}/payment-status`, statusData);
	}

	/**
	 * Verify order (for non-ZPSS payment methods)
	 * Only works for non-ZPSS payment methods
	 * Moves paymentStatus from PENDING to PAID
	 * Sets verifiedAt and paidAt timestamps
	 * Generates receipt
	 * Creates accounting transactions
	 * Sends verification SMS
	 */
	verifyOrder(id: number, verifyData: VerifyOrderDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/verify`, verifyData);
	}

	/**
	 * Process payment
	 * Restrictions:
	 * - Only works for PLACED or CONFIRMED orders
	 * - Cannot process if already paid
	 * Actions:
	 * - Sets paymentStatus to PAID
	 * - Sets paymentDate and paidAt
	 * - Generates receipt number
	 * - Creates accounting transactions
	 * - Sends SMS notification
	 */
	processPayment(id: number, paymentData: ProcessPaymentDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/payment`, paymentData);
	}

	/**
	 * Cancel order
	 * Actions:
	 * - Sets fulfillmentStatus to CANCELED
	 * - Sets paymentStatus to FAILED
	 * - Creates reversal entries if order was paid
	 * - Sends SMS notification
	 */
	cancelOrder(id: number, cancelData: CancelOrderDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, cancelData);
	}

	/**
	 * Mark order as delivered
	 * Actions:
	 * - Sets fulfillmentStatus to DELIVERED
	 * - Sets deliveredAt timestamp
	 * - Generates feedback token automatically
	 * - Sends SMS notification: SHIPPING_TO_DELIVERED event (includes {{feedbackLink}} placeholder)
	 * - Increments product sales counts
	 */
	markOrderAsDelivered(id: number, deliverData?: DeliverOrderDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/deliver`, deliverData || {});
	}

	/**
	 * Confirm order
	 * Updates payment status to PAID and fulfillment status from PLACED to CONFIRMED
	 * Requires payment method and optional transaction ID and internal notes
	 */
	confirmOrder(id: number, confirmData: ConfirmOrderDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/confirm`, confirmData);
	}

	/**
	 * Ship order
	 * Updates fulfillment status from PROCESSING to SHIPPING
	 * Requires driver name, vehicle number, and expected delivery date
	 * Optional driver phone number
	 */
	shipOrder(id: number, shipData: ShipOrderDto): Observable<Order> {
		return this.http.post<Order>(`${this.apiUrl}/${id}/ship`, shipData);
	}

	/**
	 * PATCH /orders/:id/delivery-details
	 * Update driver, vehicle, expected date, delivery notes for DELIVERY orders (CONFIRMED, PROCESSING, or SHIPPING).
	 */
	updateOrderDeliveryDetails(id: number, dto: ShipOrderDto): Observable<Order> {
		return this.http.patch<Order>(`${this.apiUrl}/${id}/delivery-details`, dto);
	}

	/**
	 * Legacy alias for backward compatibility
	 */
	deliverOrder(id: number, deliverData?: DeliverOrderDto): Observable<Order> {
		return this.markOrderAsDelivered(id, deliverData);
	}

	// ==================== Order Tracking ====================

	/**
	 * Track order
	 * Query Parameters (at least one required):
	 * - orderNumber: string (returns single order)
	 * - phoneNumber: string (returns all orders for that customer)
	 */
	trackOrder(trackOrderDto: TrackOrderDto): Observable<Order | Order[]> {
		let params = new HttpParams();
		if (trackOrderDto.orderNumber) {
			params = params.set('orderNumber', trackOrderDto.orderNumber);
		}
		if (trackOrderDto.phoneNumber) {
			params = params.set('phoneNumber', trackOrderDto.phoneNumber);
		}
		return this.http.get<Order | Order[]>(`${this.apiUrl}/track`, { params });
	}

	/**
	 * Get order timeline
	 * Returns complete event timeline for an order (event sourcing)
	 * Includes: FULFILLMENT, PAYMENT, SYSTEM, COMMUNICATION events
	 */
	getOrderTimeline(id: number): Observable<OrderTimelineEvent[]> {
		return this.http.get<OrderTimelineEvent[]>(`${this.apiUrl}/${id}/timeline`);
	}

	/**
	 * Get customer status
	 * Returns customer-friendly status message and tracking information
	 */
	getCustomerStatus(id: number): Observable<GetCustomerStatusDto> {
		return this.http.get<GetCustomerStatusDto>(`${this.apiUrl}/${id}/customer-status`);
	}

	/**
	 * Get payment receipts for an order. Includes bankAccount.
	 */
	getOrderPaymentReceipts(id: number): Observable<PaymentReceipt[]> {
		return this.http.get<PaymentReceipt[]>(`${this.apiUrl}/${id}/payment-receipts`);
	}

	/**
	 * Record payment (full or partial). Creates PaymentReceipt. Body: RecordOrderPaymentDto.
	 */
	recordOrderPayment(id: number, dto: RecordOrderPaymentDto): Observable<PaymentReceipt> {
		return this.http.post<PaymentReceipt>(`${this.apiUrl}/${id}/payments`, dto);
	}

	// ==================== Reporting ====================

	/**
	 * Get orders by month
	 * Query Parameters (required):
	 * - year: number (1900-2100)
	 * - month: number (1-12)
	 */
	getOrdersByMonth(year: number, month: number): Observable<OrdersByMonthResponseDto> {
		const params = new HttpParams()
			.set('year', year.toString())
			.set('month', month.toString());
		return this.http.get<OrdersByMonthResponseDto>(`${this.apiUrl}/by-month`, { params });
	}

	/**
	 * Get order statistics by month
	 * Query Parameters (required):
	 * - year: number (1900-2100)
	 * - month: number (1-12)
	 */
	getOrderStatisticsByMonth(year: number, month: number): Observable<OrderStatisticsByMonthResponseDto> {
		const params = new HttpParams()
			.set('year', year.toString())
			.set('month', month.toString());
		return this.http.get<OrderStatisticsByMonthResponseDto>(`${this.apiUrl}/statistics/by-month`, { params });
	}

	/**
	 * GET /orders/monthly-report – totalOrders (≠ PLACED), revenue, totalToCollect
	 */
	getOrderMonthlyReport(year: number, month: number): Observable<OrderMonthlyReportResponseDto> {
		const params = new HttpParams()
			.set('year', year.toString())
			.set('month', month.toString());
		return this.http.get<OrderMonthlyReportResponseDto>(`${this.apiUrl}/monthly-report`, { params });
	}

	/**
	 * GET /orders/daily-stats – daily summary (date YYYY-MM-DD required)
	 */
	getOrderDailyStats(date: string): Observable<OrderDailyStatsResponseDto> {
		const params = new HttpParams().set('date', date);
		return this.http.get<OrderDailyStatsResponseDto>(`${this.apiUrl}/daily-stats`, { params });
	}

	/**
	 * Get income statement
	 * Query Parameters:
	 * - startDate: ISO date string
	 * - endDate: ISO date string
	 */
	getIncomeStatement(startDate: string, endDate: string): Observable<IncomeStatement> {
		const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
		return this.http.get<IncomeStatement>(`${this.apiUrl}/reports/income-statement`, { params });
	}

	/**
	 * Get balance sheet
	 */
	getBalanceSheet(): Observable<BalanceSheet> {
		return this.http.get<BalanceSheet>(`${this.apiUrl}/reports/balance-sheet`);
	}

	// ==================== Chart of Accounts ====================

	createChartOfAccount(accountData: CreateChartOfAccountDto): Observable<ChartOfAccount> {
		return this.http.post<ChartOfAccount>(`${this.apiUrl}/chart-of-accounts`, accountData);
	}

	getChartOfAccounts(): Observable<ChartOfAccount[]> {
		return this.http.get<ChartOfAccount[]>(`${this.apiUrl}/chart-of-accounts`);
	}

	getChartOfAccountByCode(accountCode: string): Observable<ChartOfAccount> {
		return this.http.get<ChartOfAccount>(`${this.apiUrl}/chart-of-accounts/${accountCode}`);
	}

	updateChartOfAccount(accountCode: string, accountData: UpdateChartOfAccountDto): Observable<ChartOfAccount> {
		return this.http.patch<ChartOfAccount>(`${this.apiUrl}/chart-of-accounts/${accountCode}`, accountData);
	}

	deleteChartOfAccount(accountCode: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/chart-of-accounts/${accountCode}`);
	}

	// ==================== Transactions ====================

	createTransaction(transactionData: CreateTransactionDto): Observable<Transaction> {
		return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transactionData);
	}

	getTransactions(query?: TransactionQueryDto): Observable<Transaction[]> {
		let params = new HttpParams();
		if (query) {
			if (query.accountCode) params = params.set('accountCode', query.accountCode);
			if (query.startDate) params = params.set('startDate', query.startDate);
			if (query.endDate) params = params.set('endDate', query.endDate);
			if (query.orderId) params = params.set('orderId', query.orderId.toString());
		}
		return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, { params });
	}

	getTransactionById(id: number): Observable<Transaction> {
		return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`);
	}
}
