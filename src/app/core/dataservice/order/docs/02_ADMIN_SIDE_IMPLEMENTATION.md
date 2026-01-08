# Step 2: Admin Side Implementation

This document outlines the admin-side implementation for the Order Management System.

## 2.1 Admin Components Overview

### Core Admin Components
1. **AdminMasterOrdersComponent** - Main order list/table view
2. **AdminPlaceOrderComponent** - Create new orders
3. **AdminEditOrderComponent** - Edit existing orders
4. **AdminViewOrderComponent** - View order details
5. **AdminReceivePaymentComponent** - Payment processing/verification
6. **AdminViewReceiptComponent** - Receipt viewing
7. **CustomerListComponent** - Customer management

## 2.2 Admin Master Orders Component

### Features
- **Table View**: PrimeNG table with sortable columns
- **Filtering**: By customer, fulfillment status, payment status, date range
- **Search**: Global search across order fields
- **Quick Actions**: Status updates, payment processing, view details
- **Bulk Operations**: Select multiple orders for batch operations

### Table Columns
- Order Number
- Customer Name
- Order Date
- Total Amount
- Fulfillment Status (with color coding)
- Payment Status (with color coding)
- Payment Method
- Actions (View, Edit, Status Update, Payment, Cancel)

### Status Management
- Quick status update buttons for each order
- Status transition validation
- Confirmation dialogs for critical actions
- Real-time status updates

### Payment Management
- Payment verification interface
- Payment status updates
- Receipt generation
- Payment method indicators

## 2.3 Admin Place Order Component

### Form Sections
1. **Customer Information**
   - Name, Email, Phone
   - Shipping Address
   - Billing Address
   - Customer selection (existing or new)

2. **Order Items**
   - Product selection with search
   - Quantity input
   - Unit price display
   - Discount application
   - Line total calculation
   - Add/remove items

3. **Payment & Shipping**
   - Payment method selection (required)
   - Shipping cost input
   - Total amount calculation
   - Internal notes

### Validation
- Required fields validation
- Payment method must be selected
- At least one order item required
- Quantity must be > 0
- Prices must be >= 0

### Post-Creation
- Display order number
- Show order confirmation
- Option to view order details
- Option to print receipt (if ZPSS)

## 2.4 Admin Edit Order Component

### Restrictions
- Cannot edit if order is DELIVERED or CANCELED
- Cannot edit if paymentStatus is PAID (for some fields)
- Show warning messages for restricted edits

### Editable Fields
- Order line items (add/remove/update)
- Shipping cost
- Internal notes

### Read-Only Fields
- Order number
- Customer information (link to customer edit)
- Order date
- Status fields (use status update actions)

## 2.5 Admin View Order Component

### Display Sections
1. **Order Header**
   - Order number
   - Order date
   - Status badges (fulfillment & payment)
   - Total amount

2. **Customer Information**
   - Name, Email, Phone
   - Shipping Address
   - Billing Address
   - Link to customer details

3. **Order Items**
   - Product details with images
   - Quantity, unit price, discount
   - Line totals
   - Subtotal, shipping, total

4. **Payment Information**
   - Payment method
   - Payment status
   - Payment date
   - Receipt number (if generated)

5. **Order Timeline**
   - Chronological status changes
   - Timestamps for each event
   - Visual timeline representation

6. **Internal Notes**
   - Display all notes
   - Add new notes
   - Timestamp for each note

7. **Actions**
   - Update fulfillment status
   - Update payment status
   - Verify order (if pending)
   - Process payment
   - Cancel order
   - Generate receipt
   - Print receipt

## 2.6 Admin Receive Payment Component

### Payment Verification Workflow

#### For Non-ZPSS Payment Methods
1. **Verify Payment**
   - Display order details
   - Confirm payment received
   - Add verification notes
   - Submit verification

#### For CASH (COD) Orders
1. **Mark as Paid**
   - Display order details
   - Confirm cash received
   - Add payment notes
   - Submit payment confirmation

### Features
- Order search/selection
- Payment method display
- Amount confirmation
- Notes field
- Receipt generation option

## 2.7 Status Update Workflow

### Fulfillment Status Updates
```
PLACED → CONFIRMED → PROCESSING → PACKAGING → SHIPPED → DELIVERED
```

### Status Update UI
- Dropdown/buttons for next valid status
- Confirmation dialog
- Notes field for each update
- Timestamp display

### Payment Status Updates
```
PENDING → PAID (via verification or payment processing)
PENDING → FAILED (on cancellation)
```

## 2.8 Order Cancellation

### Cancellation Flow
1. Display cancellation confirmation dialog
2. Require reason (optional but recommended)
3. Show impact warning (reversals, etc.)
4. Confirm cancellation
5. Update order status
6. Send cancellation SMS

### Restrictions
- Cannot cancel if already DELIVERED
- Show warning if order is PAID (will create reversals)

## 2.9 Reporting Features

### Monthly Statistics
- Total orders
- Total revenue
- Orders by status
- Orders by payment method
- Average order value
- Completed vs cancelled orders

### Income Statement
- Revenue breakdown
- Expense breakdown
- Net income
- Date range selection

### Balance Sheet
- Assets
- Liabilities
- Equity
- Balance check

## 2.10 Implementation Checklist

- [ ] Update AdminMasterOrdersComponent to use new status enums
- [ ] Add payment status column to order table
- [ ] Implement dual status tracking (fulfillment + payment)
- [ ] Add status update methods for both statuses
- [ ] Update AdminPlaceOrderComponent to require paymentMethod
- [ ] Add payment verification workflow
- [ ] Update AdminViewOrderComponent to show timeline
- [ ] Add customer status message display
- [ ] Implement order cancellation with reason
- [ ] Add receipt generation functionality
- [ ] Update all status displays to use new enums
- [ ] Add validation for status transitions
- [ ] Implement reporting components
- [ ] Add bulk operations support

