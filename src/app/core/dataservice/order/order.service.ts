import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Order,
	CreateOrderDto,
	UpdateOrderDto,
	UpdateOrderStatusDto,
	UpdateFulfillmentStatusDto,
	UpdatePaymentStatusDto,
	ProcessPaymentDto,
	VerifyOrderDto,
	CancelOrderDto,
	DeliverOrderDto,
	OrderQueryDto,
	MonthQueryDto,
	OrdersByMonthResponseDto,
	OrderStatisticsByMonthResponseDto,
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
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class OrderService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/orders`;

	constructor(private http: HttpClient) {}

	// ==================== Order Management ====================

	/**
	 * Create a new order
	 * Automatically generates orderNumber (ORD-YYYY-####)
	 * Sets fulfillmentStatus to PLACED
	 * Sets paymentStatus to PENDING (or PAID for ZPSS)
	 * Sets placedAt timestamp
	 * Sends SMS notification:
	 * - If orderType: 'COUNTER' → COUNTER_PAYMENT_RECEIPT (7-minute delay)
	 * - If orderType: 'ONLINE' → ORDER_PLACED (immediate)
	 * For ZPSS: Auto-verifies and sets payment to PAID
	 */
	createOrder(orderData: CreateOrderDto): Observable<Order> {
		return this.http.post<Order>(this.apiUrl, orderData);
	}

	/**
	 * Get all orders with optional filters
	 * Query Parameters (all optional):
	 * - customerId: number
	 * - fulfillmentStatus: FulfillmentStatus
	 * - startDate: ISO date string
	 * - endDate: ISO date string
	 */
	getOrders(query?: OrderQueryDto): Observable<Order[]> {
		let params = new HttpParams();
		if (query) {
			if (query.customerId) params = params.set('customerId', query.customerId.toString());
			if (query.fulfillmentStatus) params = params.set('fulfillmentStatus', query.fulfillmentStatus);
			if (query.startDate) params = params.set('startDate', query.startDate);
			if (query.endDate) params = params.set('endDate', query.endDate);
		}
		return this.http.get<Order[]>(this.apiUrl, { params });
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
