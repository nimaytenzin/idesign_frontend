# Step 3: Public Order Side Implementation

This document outlines the public-facing (customer) implementation for the Order Management System.

## 3.1 Public Components Overview

### Core Public Components
1. **PublicOrderTrackingComponent** - Order tracking interface
2. **PublicOrderConfirmationComponent** - Order confirmation page
3. **PublicOrderPaymentComponent** - Payment processing (if needed)
4. **PublicCheckoutComponent** - Order placement

## 3.2 Order Tracking Component

### Features
- **Dual Search Options**:
  - Track by Order Number
  - Track by Phone Number (shows all orders for customer)

### UI Elements

#### Search Interface
- Two input fields (order number, phone number)
- At least one field required
- Search button
- Clear button
- Validation messages

#### Order Display
- Order number (as tracking number)
- Customer-friendly status message
- Current fulfillment status
- Current payment status
- Order date
- Total amount

#### Timeline View
- Visual timeline/progress bar
- Status steps:
  - Placed
  - Confirmed
  - Processing
  - Packaging
  - Shipped
  - Delivered
- Timestamps for each step
- Current status highlighted
- Payment status indicator

#### Order Details
- Customer information
- Order items with product details
- Shipping information
- Payment information
- Tracking number (orderNumber)

### Status Messages (Customer-Facing)

| Fulfillment Status | Payment Status | Customer Message |
|-------------------|----------------|------------------|
| PLACED | PENDING | "Awaiting Verification. Your order requires confirmation before processing can begin." |
| CONFIRMED | PENDING | "Order Under Review. We're verifying your payment details." |
| PROCESSING | PAID | "Processing Your Order. We're preparing your items." |
| PACKAGING | PAID | "Ready for Shipment! Your order is being packed and will ship shortly." |
| SHIPPED | PAID | "Out for Delivery! Your order has been shipped. Tracking: [OrderNumber]" |
| SHIPPED | PENDING (CASH) | "Out for Delivery! Tracking: [OrderNumber]. Please prepare exact payment for the courier." |
| DELIVERED | PAID | "Delivered! Your order has been successfully delivered." |
| CANCELED | FAILED | "Order Canceled. The payment or verification failed. Please contact support." |

### Implementation Notes
- Use `customerStatusMessage` from API response
- Display tracking number prominently when shipped
- Show timeline with all status changes
- Format dates in user-friendly format
- Handle not found errors gracefully

## 3.3 Order Confirmation Component

### Display After Order Creation
- Order number (prominently displayed)
- Order summary
- Customer information confirmation
- Order items list
- Total amount
- Payment method
- Next steps message

### Features
- Print order confirmation
- Track order button (links to tracking)
- Continue shopping button
- Order number copy to clipboard

### ZPSS Orders
- Show payment confirmation
- Display receipt number (if generated)
- Download receipt option

### Other Payment Methods
- Show verification pending message
- Explain next steps
- Provide contact information

## 3.4 Checkout Component

### Form Sections
1. **Customer Information**
   - Name (required)
   - Email (required, validation)
   - Phone Number (required, validation)
   - Shipping Address (required)
   - Billing Address (optional, defaults to shipping)

2. **Order Review**
   - Product list with images
   - Quantities
   - Prices
   - Discounts
   - Subtotal
   - Shipping cost
   - Total

3. **Payment Method Selection**
   - Radio buttons or dropdown
   - All payment methods available
   - Required field
   - Method descriptions

4. **Order Submission**
   - Terms and conditions checkbox
   - Submit order button
   - Loading state
   - Error handling

### Validation
- All required fields
- Email format validation
- Phone number format validation
- At least one order item
- Payment method selected
- Terms accepted

### Post-Submission
- Redirect to order confirmation
- Display order number
- Show success message

## 3.5 Order Tracking API Integration

### Track by Order Number
```typescript
trackOrderByNumber(orderNumber: string): Observable<Order> {
  return this.orderService.trackOrder({ orderNumber });
}
```

### Track by Phone Number
```typescript
trackOrderByPhone(phoneNumber: string): Observable<Order[]> {
  return this.orderService.trackOrder({ phoneNumber });
}
```

### Get Order Timeline
```typescript
getOrderTimeline(orderId: number): Observable<OrderTimeline> {
  return this.orderService.getOrderTimeline(orderId);
}
```

### Get Customer Status
```typescript
getCustomerStatus(orderId: number): Observable<GetCustomerStatusDto> {
  return this.orderService.getCustomerStatus(orderId);
}
```

## 3.6 Timeline UI Component

### Visual Timeline
- Vertical or horizontal timeline
- Status steps as milestones
- Current status highlighted
- Completed steps marked
- Pending steps grayed out
- Timestamps below each step

### Timeline Data Structure
```typescript
interface TimelineEvent {
  status: string;
  timestamp: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}
```

### Status Icons
- PLACED: Calendar icon
- CONFIRMED: Check icon
- PROCESSING: Cog icon
- PACKAGING: Box icon
- SHIPPED: Truck icon
- DELIVERED: Check circle icon
- PAID: Dollar icon

## 3.7 Error Handling

### Not Found Errors
- Friendly "Order not found" message
- Suggestions to check order number
- Link to contact support

### Network Errors
- Retry button
- Error message display
- Fallback UI

### Validation Errors
- Field-level error messages
- Inline validation feedback
- Form submission prevention

## 3.8 Responsive Design

### Mobile Considerations
- Simplified timeline view
- Stacked form fields
- Touch-friendly buttons
- Readable text sizes
- Easy navigation

### Desktop Considerations
- Side-by-side layout
- Detailed timeline view
- Expanded order details
- Quick actions

## 3.9 Implementation Checklist

- [ ] Create/update PublicOrderTrackingComponent
- [ ] Implement dual search (order number + phone)
- [ ] Display customer-friendly status messages
- [ ] Create timeline visualization component
- [ ] Update PublicOrderConfirmationComponent
- [ ] Add payment method to checkout
- [ ] Update PublicCheckoutComponent validation
- [ ] Implement order timeline display
- [ ] Add tracking number display
- [ ] Handle all error cases
- [ ] Add responsive design
- [ ] Implement print functionality
- [ ] Add copy-to-clipboard for order number
- [ ] Test all payment methods
- [ ] Test status message display for all combinations

