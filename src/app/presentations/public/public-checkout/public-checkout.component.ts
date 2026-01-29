import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';

// Services
import { CartService, CartItem } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/dataservice/order/order.service';
import { DeliveryRateService } from '../../../core/dataservice/delivery-rate/delivery-rate.service';
import { DeliveryRate, getTransportModeLabel } from '../../../core/dataservice/delivery-rate/delivery-rate.interface';
import { PaymentMethod } from '../../../core/dataservice/account/account.interface';
import { MessageService } from 'primeng/api';
import { ImageUtilityService } from '../../../core/utility/image-utility.service';
import { Discount, DiscountValueType, DiscountCalculationResult } from '../../../core/dataservice/discount/discount.interface';
import { DiscountService } from '../../../core/dataservice/discount/discount.service';
import { CreateOrderDto, Order, OrderCheckoutResponseDto } from '../../../core/dataservice';
import { OrderSource, FulfillmentType } from '../../../core/constants/enums';

@Component({
	selector: 'app-public-checkout',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		InputTextModule,
		TextareaModule,
		ToastModule,
		ProgressSpinnerModule,
		CardModule,
		InputNumberModule,
		InputGroupModule,
		InputGroupAddonModule,
		DropdownModule,
		SelectButtonModule,
	],
	providers: [MessageService],
	templateUrl: './public-checkout.component.html',
	styleUrls: ['./public-checkout.component.scss'],
})
export class PublicCheckoutComponent implements OnInit {
	// PaymentMethod is now a type, not an enum - use string literals
	PaymentMethodOptions = {
		CASH: 'CASH' as PaymentMethod,
		MBOB: 'MBOB' as PaymentMethod,
		BDB_EPAY: 'BDB_EPAY' as PaymentMethod,
		TPAY: 'TPAY' as PaymentMethod,
		BNB_MPAY: 'BNB_MPAY' as PaymentMethod,
		ZPSS: 'ZPSS' as PaymentMethod,
	};
	
	cartItems: CartItem[] = [];
	customerForm = {
		name: '',
		email: '',
		phoneNumber: '',
		address: '',
		paymentMethod: 'ZPSS' as PaymentMethod,
		remarks: '',
		voucherCode: '',
	};
	placingOrder = false;
	orderId: number | null = null;
	orderNumber: string | null = null;
	/** Set when order was created but payment initiation failed; user can retry payment. */
	checkoutOrderCreatedPaymentFailed: Order | null = null;
	checkoutPaymentError: string | null = null;
	voucherCodeApplied: boolean = false;
	voucherCodeError: string | null = null;
	voucherDiscountResult: DiscountCalculationResult | null = null;
	validatingVoucher: boolean = false;

	// Fulfillment: Delivery (requires delivery rate + address) or Pickup
	FulfillmentType = FulfillmentType;
	fulfillmentType: FulfillmentType = FulfillmentType.DELIVERY;
	deliveryRates: DeliveryRate[] = [];
	selectedDeliveryRate: DeliveryRate | null = null;
	deliveryCost = 0;
	getTransportModeLabel = getTransportModeLabel;

	fulfillmentOptions = [
		{ label: 'Delivery', value: FulfillmentType.DELIVERY },
		{ label: 'Pickup', value: FulfillmentType.PICKUP },
	];

	constructor(
		private cartService: CartService,
		private orderService: OrderService,
		private deliveryRateService: DeliveryRateService,
		private discountService: DiscountService,
		private imageUtilityService: ImageUtilityService,
		private messageService: MessageService,
		private router: Router,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCartItems();
		this.loadDeliveryRates();
	}

	loadDeliveryRates() {
		this.deliveryRateService.getDeliveryRates().subscribe({
			next: (data) => {
				this.deliveryRates = data || [];
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Could not load delivery rates' });
				this.cdr.markForCheck();
			},
		});
	}

	onFulfillmentTypeChange() {
		if (this.fulfillmentType !== FulfillmentType.DELIVERY) {
			this.selectedDeliveryRate = null;
			this.deliveryCost = 0;
		}
		this.cdr.markForCheck();
	}

	onDeliveryRateChange() {
		if (this.selectedDeliveryRate) {
			const rate = this.selectedDeliveryRate.rate;
			this.deliveryCost = typeof rate === 'string' ? parseFloat(rate) : Number(rate) || 0;
		} else {
			this.deliveryCost = 0;
		}
		this.cdr.markForCheck();
	}

	getDeliveryRateDisplay(rate: DeliveryRate): string {
		if (!rate) return '';
		return rate.deliveryLocation?.name || `Location ${rate.deliveryLocationId}`;
	}

	formatDeliveryCurrency(value: number): string {
		return `Nu. ${(value ?? 0).toFixed(2)}`;
	}

	loadCartItems() {
		this.cartItems = this.cartService.getCartItems();
		
		if (this.cartItems.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Cart Empty',
				detail: 'Your cart is empty. Please add items before checkout.',
			});
			this.router.navigate(['/products']);
		}
		
		this.cdr.markForCheck();
	}

	getSubtotal(): number {
		// Calculate subtotal with discounts applied
		return this.cartItems.reduce((sum, item) => {
			const itemPrice = this.getItemPrice(item);
			return sum + (itemPrice * item.quantity);
		}, 0);
	}

	getTotalDiscount(): number {
		// Calculate total discount amount
		return this.cartItems.reduce((sum, item) => {
			const discountAmount = this.getItemDiscountAmount(item);
			return sum + (discountAmount * item.quantity);
		}, 0);
	}

	getVoucherDiscount(): number {
		// Get order-level discount from voucher code
		return this.voucherDiscountResult?.orderDiscount || 0;
	}

	getTotal(): number {
		const subtotal = this.getSubtotal();
		const voucherDiscount = this.getVoucherDiscount();
		const delivery = this.fulfillmentType === FulfillmentType.DELIVERY ? this.deliveryCost : 0;
		return Math.max(0, subtotal - voucherDiscount + delivery);
	}

	/**
	 * Get the price for a cart item (with discount applied if available)
	 */
	getItemPrice(item: CartItem): number {
		if (item.discount) {
			const discountAmount = this.calculateDiscountAmount(item.product.price, item.discount);
			return Math.max(0, item.product.price - discountAmount);
		}
		return item.product.price;
	}

	/**
	 * Get the discount amount for a cart item
	 */
	getItemDiscountAmount(item: CartItem): number {
		if (item.discount) {
			return this.calculateDiscountAmount(item.product.price, item.discount);
		}
		return 0;
	}

	/**
	 * Calculate discount amount based on discount type
	 */
	private calculateDiscountAmount(price: number, discount: Discount): number {
		// Ensure discountValue is a number
		const discountValue = typeof discount.discountValue === 'string' 
			? parseFloat(discount.discountValue) 
			: discount.discountValue;

		if (discount.valueType === DiscountValueType.PERCENTAGE) {
			return (price * discountValue) / 100;
		} else {
			// FIXED_AMOUNT
			return Math.min(discountValue, price);
		}
	}

	/**
	 * Check if item has discount
	 */
	hasDiscount(item: CartItem): boolean {
		return item.discount !== null && item.discount !== undefined;
	}

	/**
	 * Get original price for display
	 */
	getOriginalPrice(item: CartItem): number {
		return item.product.price;
	}

	updateQuantity(productId: number, quantity: number | null) {
		const qty = quantity || 1;
		if (qty <= 0) {
			this.removeItem(productId);
		} else {
			this.cartService.updateQuantity(productId, qty);
			// Recalculate discounts based on new quantity
			this.recalculateDiscountsForItem(productId, qty);
			this.loadCartItems();
			// Recalculate voucher discount if voucher code is applied
			if (this.voucherCodeApplied && this.customerForm.voucherCode) {
				this.applyVoucherCode();
			}
		}
	}

	/**
	 * Recalculate discount for an item based on its quantity (cart total for that product)
	 */
	private recalculateDiscountsForItem(productId: number, quantity: number) {
		const cartItems = this.cartService.getCartItems();
		const item = cartItems.find(i => i.product.id === productId);
		
		if (!item || !item.product.discountProducts || item.product.discountProducts.length === 0) {
			return;
		}

		// Get active discounts for this product
		const activeDiscounts = this.getActiveDiscounts(item.product);
		if (activeDiscounts.length === 0) {
			return;
		}

		// Calculate cart total for this product
		const cartTotalForProduct = item.product.price * quantity;

		// Find the best discount that can be applied (meets min order value)
		let bestDiscount: Discount | null = null;
		let maxDiscountAmount = 0;

		for (const discount of activeDiscounts) {
			// Check if minimum order value constraint is met
			const meetsMinOrderValue = !discount.minOrderValue || 
				discount.minOrderValue === null || 
				cartTotalForProduct >= discount.minOrderValue;

			if (meetsMinOrderValue) {
				const discountAmount = this.calculateDiscountAmount(item.product.price, discount);
				if (discountAmount > maxDiscountAmount) {
					maxDiscountAmount = discountAmount;
					bestDiscount = discount;
				}
			}
		}

		// Update the discount in cart if it changed
		if (bestDiscount !== item.discount) {
			// Remove item and re-add with new discount
			this.cartService.removeFromCart(productId);
			this.cartService.addToCart(item.product, quantity, bestDiscount);
		}
	}

	/**
	 * Get active discounts for a product (same logic as product catalog)
	 */
	private getActiveDiscounts(product: any): Discount[] {
		if (!product.discountProducts || product.discountProducts.length === 0) {
			return [];
		}

		const now = new Date();
		return product.discountProducts
			.map((dp: any) => dp.discount)
			.filter((discount: Discount | undefined): discount is Discount => {
				if (!discount) return false;
				if (!discount.isActive) return false;
				
				const startDate = new Date(discount.startDate);
				const endDate = new Date(discount.endDate);
				
				return now >= startDate && now <= endDate;
			});
	}

	onQuantityChange(productId: number, event: any) {
		const value = event?.value;
		const quantity = typeof value === 'number' ? value : parseInt(String(value), 10) || 1;
		this.updateQuantity(productId, quantity);
	}

	increaseQuantity(productId: number) {
		const item = this.cartItems.find(i => i.product.id === productId);
		if (item) {
			this.updateQuantity(productId, item.quantity + 1);
		}
	}

	decreaseQuantity(productId: number) {
		const item = this.cartItems.find(i => i.product.id === productId);
		if (item && item.quantity > 1) {
			this.updateQuantity(productId, item.quantity - 1);
		}
	}

	removeItem(productId: number) {
		this.cartService.removeFromCart(productId);
		this.loadCartItems();
		
		// Recalculate voucher discount if voucher code is applied
		if (this.voucherCodeApplied && this.customerForm.voucherCode && this.cartItems.length > 0) {
			this.applyVoucherCode();
		}
		
		if (this.cartItems.length === 0) {
			// Clear voucher discount when cart is empty
			this.voucherDiscountResult = null;
			this.voucherCodeApplied = false;
			this.router.navigate(['/products']);
		}
	}

	formatPrice(price: number): number {
		// Return price without formatting
		return price;
	}

	getPrimaryImage(product: any): string {
		return this.imageUtilityService.getPrimaryImageUrl(product.images || []);
	}

	placeOrder() {
		// Validate form
		if (!this.customerForm.name) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields (Name)',
			});
			return;
		}

		if (!this.customerForm.phoneNumber) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Phone number is required',
			});
			return;
		}

		// Validate phone number is exactly 8 digits
		const phoneNumber = this.customerForm.phoneNumber.replace(/\D/g, ''); // Remove non-digits
		if (phoneNumber.length !== 8) {
			this.messageService.add({
				severity: 'error',
				summary: 'Invalid Phone Number',
				detail: 'Phone number must be exactly 8 digits',
			});
			return;
		}

		if (this.customerForm.email && !this.isValidEmail(this.customerForm.email)) {
			this.messageService.add({
				severity: 'error',
				summary: 'Invalid Email',
				detail: 'Please enter a valid email address',
			});
			return;
		}

		if (this.cartItems.length === 0) {
			this.messageService.add({
				severity: 'error',
				summary: 'Cart Empty',
				detail: 'Your cart is empty. Please add items before placing an order.',
			});
			return;
		}

		if (this.fulfillmentType === FulfillmentType.DELIVERY) {
			if (!this.selectedDeliveryRate) {
				this.messageService.add({
					severity: 'error',
					summary: 'Validation Error',
					detail: 'Please select a delivery location and mode',
				});
				return;
			}
			if (!this.customerForm.address?.trim()) {
				this.messageService.add({
					severity: 'error',
					summary: 'Validation Error',
					detail: 'Shipping address is required for delivery',
				});
				return;
			}
		}

		this.placingOrder = true;
		this.cdr.markForCheck();

		// Clean phone number (remove non-digits)
		const cleanedPhoneNumber = this.customerForm.phoneNumber.replace(/\D/g, '');

		// Prepare order data
		const isDelivery = this.fulfillmentType === FulfillmentType.DELIVERY;
		const orderData: CreateOrderDto = {
			customer: {
				name: this.customerForm.name,
				email: this.customerForm.email || undefined,
				phoneNumber: cleanedPhoneNumber || undefined,
				shippingAddress: this.customerForm.address || undefined,
				billingAddress: this.customerForm.address || undefined,
			},
			orderItems: this.cartItems.map((item) => {
				const discountAmount = this.getItemDiscountAmount(item);
				return {
					productId: item.product.id!,
					quantity: item.quantity,
					unitPrice: item.product.price,
					discountApplied: discountAmount,
				};
			}),
			orderSource: OrderSource.ONLINE, // Public orders are always ONLINE
			fulfillmentType: this.fulfillmentType,
			paymentMethod: this.customerForm.paymentMethod!,
			internalNotes: this.customerForm.remarks || undefined,
			voucherCode: this.customerForm.voucherCode?.trim().toUpperCase() || undefined,
			// Required when fulfillmentType is DELIVERY
			...(isDelivery &&
				this.selectedDeliveryRate && {
					deliveryRateId: this.selectedDeliveryRate.id,
					shippingAddress: this.customerForm.address?.trim() || undefined,
					deliveryCost: this.deliveryCost,
				}),
		};

		// Single entry: create order + initiate payment (POST /orders/online/checkout)
		this.orderService.createOnlineCheckout(orderData).subscribe({
			next: (response: OrderCheckoutResponseDto) => {
				this.placingOrder = false;
				const order = response.order;
				this.orderId = order.id;
				this.orderNumber = order.orderNumber;

				// Clear cart on success (order created)
				this.cartService.clearCart();

				if (response.paymentFailed && response.paymentError) {
					// Order created but payment initiation failed – offer retry
					this.checkoutOrderCreatedPaymentFailed = order;
					this.checkoutPaymentError = response.paymentError;
					this.messageService.add({
						severity: 'warn',
						summary: 'Order Placed – Payment Not Started',
						detail: response.paymentError + ' You can retry payment below.',
						life: 8000,
					});
					this.cdr.markForCheck();
					return;
				}

				if (response.paymentInitiation) {
					// Success: order + payment initiated – go to payment page with state (no extra initiate call)
					this.messageService.add({
						severity: 'success',
						summary: 'Order Placed',
						detail: `Order #${order.orderNumber} created. Complete payment below.`,
						life: 5000,
					});
					this.cdr.markForCheck();
					this.router.navigate(['/order-payment'], {
						queryParams: { orderId: order.id },
						state: { order, paymentInitiation: response.paymentInitiation },
					});
					return;
				}

				// Fallback: order only (shouldn't happen per API spec)
				this.messageService.add({
					severity: 'success',
					summary: 'Order Placed',
					detail: `Order #${order.orderNumber} has been placed.`,
					life: 5000,
				});
				this.cdr.markForCheck();
				this.router.navigate(['/order-payment'], {
					queryParams: { orderId: order.id },
				});
			},
			error: (error) => {
				this.placingOrder = false;
				console.error('Error during checkout:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Checkout Failed',
					detail: error.error?.message || 'Failed to place order. Please try again or contact support.',
					life: 5000,
				});
				this.cdr.markForCheck();
			},
		});
	}

	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	goToProducts() {
		this.router.navigate(['/products']);
	}

	/** Navigate to payment page to retry (uses POST /payment-settlement/initiate-payment with orderId + amount). */
	goToRetryPayment() {
		if (!this.checkoutOrderCreatedPaymentFailed) return;
		this.router.navigate(['/order-payment'], {
			queryParams: { orderId: this.checkoutOrderCreatedPaymentFailed.id },
		});
	}

	/**
	 * Apply voucher code and calculate discount preview
	 * Voucher codes are case-insensitive and will be normalized to uppercase
	 */
	applyVoucherCode() {
		const code = this.customerForm.voucherCode?.trim().toUpperCase();
		if (!code) {
			this.voucherCodeError = 'Please enter a voucher code';
			this.voucherCodeApplied = false;
			this.voucherDiscountResult = null;
			return;
		}

		// Normalize to uppercase (backend does this too, but do it here for consistency)
		this.customerForm.voucherCode = code;

		// Clear previous errors
		this.voucherCodeError = null;
		this.validatingVoucher = true;

		// Prepare order items for discount calculation
		const orderItems = this.cartItems.map((item) => ({
			productId: item.product.id!,
			quantity: item.quantity,
			unitPrice: item.product.price,
		}));

		// Calculate discount preview
		this.discountService.calculateDiscounts({
			orderItems,
			voucherCode: code,
		}).subscribe({
			next: (result: DiscountCalculationResult) => {
				this.validatingVoucher = false;
				this.voucherDiscountResult = result;
				this.voucherCodeApplied = true;

				if (result.orderDiscount > 0 || result.lineItemDiscounts.length > 0) {
					this.messageService.add({
						severity: 'success',
						summary: 'Voucher Code Applied',
						detail: `Discount of Nu. ${result.orderDiscount.toFixed(2)} will be applied to your order.`,
						life: 3000,
					});
				} else {
					this.messageService.add({
						severity: 'info',
						summary: 'Voucher Code',
						detail: 'Voucher code is valid but no discount applies. It may be linked to an affiliate marketer.',
						life: 3000,
					});
				}
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.validatingVoucher = false;
				this.voucherCodeApplied = false;
				this.voucherDiscountResult = null;

				// Check if it's a validation error or just no discount
				if (error.status === 400 || error.status === 404) {
					this.voucherCodeError = error.error?.message || 'Invalid or expired voucher code';
					this.messageService.add({
						severity: 'error',
						summary: 'Invalid Voucher Code',
						detail: error.error?.message || 'The voucher code you entered is invalid or has expired.',
						life: 3000,
					});
				} else {
					this.voucherCodeError = 'Unable to validate voucher code. Please try again.';
					this.messageService.add({
						severity: 'warn',
						summary: 'Validation Error',
						detail: 'Unable to validate voucher code. It will still be sent with your order.',
						life: 3000,
					});
					// Still allow the code to be used (backend will validate)
					this.voucherCodeApplied = true;
				}
				this.cdr.markForCheck();
			},
		});
	}

	/**
	 * Remove voucher code
	 */
	removeVoucherCode() {
		this.customerForm.voucherCode = '';
		this.voucherCodeApplied = false;
		this.voucherCodeError = null;
		this.voucherDiscountResult = null;
		this.cdr.markForCheck();
	}
}

