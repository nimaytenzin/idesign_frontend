# Step 1: DTOs and Data Services

This document outlines the DTOs (Data Transfer Objects) and data service implementation for the Order Management System.

## 1.1 Enums

### FulfillmentStatus
```typescript
enum FulfillmentStatus {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKAGING = 'PACKAGING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}
```

### PaymentMethod
```typescript
enum PaymentMethod {
  CASH = 'CASH',           // Cash on Delivery (requires verification)
  MBOB = 'MBOB',           // Requires verification
  BDB_EPAY = 'BDB_EPAY',   // Requires verification
  TPAY = 'TPAY',           // Requires verification
  BNB_MPAY = 'BNB_MPAY',   // Requires verification
  ZPSS = 'ZPSS'            // Auto-verified (payment gateway)
}
```

## 1.2 Order Creation DTOs

### CreateOrderDto
```typescript
interface CreateOrderDto {
  customer: CustomerDetailsDto;
  orderLineItems: CreateOrderLineItemDto[];
  paymentMethod: PaymentMethod; // Required
  shippingCost?: number; // Optional, minimum 0
  internalNotes?: string; // Optional
}
```

### CustomerDetailsDto
```typescript
interface CustomerDetailsDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  shippingAddress?: string;
  billingAddress?: string;
}
```

### CreateOrderLineItemDto
```typescript
interface CreateOrderLineItemDto {
  productId: number; // Required
  quantity: number; // Required, minimum 1
  unitPrice: number; // Required, minimum 0
  discountApplied?: number; // Optional, minimum 0
}
```

## 1.3 Order Update DTOs

### UpdateOrderDto
```typescript
interface UpdateOrderDto {
  orderLineItems?: CreateOrderLineItemDto[];
  shippingCost?: number;
  internalNotes?: string;
}
```

### UpdateOrderStatusDto
```typescript
interface UpdateOrderStatusDto {
  fulfillmentStatus?: FulfillmentStatus; // Optional
  paymentStatus?: PaymentStatus; // Optional
  internalNotes?: string; // Optional
}
```

### UpdateFulfillmentStatusDto
```typescript
interface UpdateFulfillmentStatusDto {
  fulfillmentStatus: FulfillmentStatus; // Required
  internalNotes?: string; // Optional
}
```

### UpdatePaymentStatusDto
```typescript
interface UpdatePaymentStatusDto {
  paymentStatus: PaymentStatus; // Required
  internalNotes?: string; // Optional
}
```

## 1.4 Payment and Verification DTOs

### ProcessPaymentDto
```typescript
interface ProcessPaymentDto {
  paymentMethod: PaymentMethod; // Required
  paymentDate?: string; // Optional, ISO date string
  internalNotes?: string; // Optional
}
```

### VerifyOrderDto
```typescript
interface VerifyOrderDto {
  internalNotes?: string; // Optional
}
```

## 1.5 Query and Response DTOs

### OrderQueryDto
```typescript
interface OrderQueryDto {
  customerId?: number;
  fulfillmentStatus?: FulfillmentStatus;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}
```

### TrackOrderDto
```typescript
interface TrackOrderDto {
  orderNumber?: string; // At least one required
  phoneNumber?: string; // At least one required
}
```

### GetCustomerStatusDto
```typescript
interface GetCustomerStatusDto {
  customerStatusMessage: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
}
```

### MonthQueryDto
```typescript
interface MonthQueryDto {
  year: number; // 1900-2100
  month: number; // 1-12
}
```

## 1.6 Order Response Structure

### Order Entity (Full Response)
```typescript
interface Order {
  id: number;
  orderNumber: string; // Format: ORD-YYYY-####
  customerId: number;
  orderDate: string; // ISO date string
  totalAmount: number;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string; // ISO date string
  paymentMethod?: PaymentMethod;
  receiptGenerated: boolean;
  receiptNumber?: string; // Format: RCP-YYYY-####
  shippingCost: number;
  internalNotes?: string;
  
  // Timestamp fields
  placedAt?: string; // ISO date string
  verifiedAt?: string; // ISO date string
  processingStartedAt?: string; // ISO date string
  packagingStartedAt?: string; // ISO date string
  shippedAt?: string; // ISO date string
  deliveredAt?: string; // ISO date string
  paidAt?: string; // ISO date string
  
  // Relations (when included)
  customer?: Customer;
  orderLineItems?: OrderLineItem[];
  transactions?: Transaction[];
  
  // Customer-facing field (included in GET /orders/:id)
  customerStatusMessage?: string;
}
```

### OrderLineItem
```typescript
interface OrderLineItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
  lineTotal: number;
  product?: Product; // When included
}
```

### Customer
```typescript
interface Customer {
  id: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  shippingAddress?: string;
  billingAddress?: string;
}
```

## 1.7 Data Service Methods

### Customer Management
- `createCustomer(customerData: CreateCustomerDto): Observable<Customer>`
- `getCustomers(): Observable<Customer[]>`
- `getCustomerById(id: number): Observable<Customer>`
- `updateCustomer(id: number, customerData: UpdateCustomerDto): Observable<Customer>`
- `deleteCustomer(id: number): Observable<void>`

### Order Management
- `createOrder(orderData: CreateOrderDto): Observable<Order>`
- `getOrders(query?: OrderQueryDto): Observable<Order[]>`
- `getOrderById(id: number): Observable<Order>`
- `updateOrder(id: number, orderData: UpdateOrderDto): Observable<Order>`
- `deleteOrder(id: number): Observable<void>`

### Order Status Management
- `updateOrderStatus(id: number, statusData: UpdateOrderStatusDto): Observable<Order>`
- `updateFulfillmentStatus(id: number, statusData: UpdateFulfillmentStatusDto): Observable<Order>`
- `updatePaymentStatus(id: number, statusData: UpdatePaymentStatusDto): Observable<Order>`
- `verifyOrder(id: number, verifyData: VerifyOrderDto): Observable<Order>`
- `processPayment(id: number, paymentData: ProcessPaymentDto): Observable<Order>`
- `cancelOrder(id: number, cancelData: { reason?: string }): Observable<Order>`

### Order Tracking
- `trackOrder(trackOrderDto: TrackOrderDto): Observable<Order | Order[]>`
- `getOrderTimeline(id: number): Observable<OrderTimeline>`
- `getCustomerStatus(id: number): Observable<GetCustomerStatusDto>`

### Reporting
- `getOrdersByMonth(year: number, month: number): Observable<OrdersByMonthResponseDto>`
- `getOrderStatisticsByMonth(year: number, month: number): Observable<OrderStatisticsByMonthResponseDto>`
- `getIncomeStatement(startDate: string, endDate: string): Observable<IncomeStatement>`
- `getBalanceSheet(): Observable<BalanceSheet>`

## 1.8 Implementation Checklist

- [ ] Update FulfillmentStatus enum (remove DRAFT, COMPLETED, CANCELLED; add PLACED, CONFIRMED, PROCESSING, PACKAGING, SHIPPED, DELIVERED, CANCELED)
- [ ] Add PaymentStatus enum
- [ ] Update PaymentMethod enum (remove CREDIT_CARD, BANK_TRANSFER, OTHER)
- [ ] Add paymentMethod to CreateOrderDto
- [ ] Add paymentStatus to Order interface
- [ ] Add all timestamp fields to Order interface
- [ ] Add customerStatusMessage to Order interface
- [ ] Create UpdateFulfillmentStatusDto
- [ ] Create UpdatePaymentStatusDto
- [ ] Create VerifyOrderDto
- [ ] Create GetCustomerStatusDto
- [ ] Create OrderTimeline interface
- [ ] Update OrderService with all new methods
- [ ] Update existing methods to match API guide

