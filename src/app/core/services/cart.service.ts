import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Product } from '../dataservice/product/product.interface';
import { Discount, DiscountValueType } from '../dataservice/discount/discount.interface';

export interface CartItem {
	product: Product;
	quantity: number;
	discount?: Discount | null; // Optional discount applied to this product
}

@Injectable({
	providedIn: 'root',
})
export class CartService {
	private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
	public cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

	// Animation trigger for cart icon
	private cartAnimationTrigger = new Subject<void>();
	public cartAnimation$: Observable<void> = this.cartAnimationTrigger.asObservable();

	private readonly CART_STORAGE_KEY = 'idesign_cart';

	constructor() {
		// Load cart from localStorage on initialization
		this.loadCartFromStorage();
	}

	/**
	 * Add product to cart or update quantity if already exists
	 * @param product Product to add
	 * @param quantity Quantity to add (default: 1)
	 * @param discount Optional discount to apply to this product
	 */
	addToCart(product: Product, quantity: number = 1, discount?: Discount | null): void {
		const currentCart = this.cartItemsSubject.value;
		const existingItemIndex = currentCart.findIndex(
			(item) => item.product.id === product.id
		);

		if (existingItemIndex >= 0) {
			// Update quantity if product already in cart
			// Also update discount if provided
			currentCart[existingItemIndex].quantity += quantity;
			if (discount !== undefined) {
				currentCart[existingItemIndex].discount = discount;
			}
		} else {
			// Add new item to cart with discount
			currentCart.push({ product, quantity, discount: discount || null });
		}

		this.updateCart(currentCart);
		
		// Trigger cart animation
		this.triggerCartAnimation();
	}

	/**
	 * Trigger cart icon animation
	 */
	triggerCartAnimation(): void {
		this.cartAnimationTrigger.next();
	}

	/**
	 * Remove product from cart
	 */
	removeFromCart(productId: number): void {
		const currentCart = this.cartItemsSubject.value.filter(
			(item) => item.product.id !== productId
		);
		this.updateCart(currentCart);
	}

	/**
	 * Update quantity of a cart item
	 */
	updateQuantity(productId: number, quantity: number): void {
		if (quantity <= 0) {
			this.removeFromCart(productId);
			return;
		}

		const currentCart = this.cartItemsSubject.value.map((item) =>
			item.product.id === productId ? { ...item, quantity } : item
		);
		this.updateCart(currentCart);
	}

	/**
	 * Clear all items from cart
	 */
	clearCart(): void {
		this.updateCart([]);
	}

	/**
	 * Get current cart items
	 */
	getCartItems(): CartItem[] {
		return this.cartItemsSubject.value;
	}

	/**
	 * Get total number of items in cart
	 */
	getTotalItems(): number {
		return this.cartItemsSubject.value.reduce(
			(total, item) => total + item.quantity,
			0
		);
	}

	/**
	 * Get total price of all items in cart (after discounts if applied)
	 */
	getTotalPrice(): number {
		return this.cartItemsSubject.value.reduce((total, item) => {
			// Use product price (which should already have discount applied)
			// or calculate discounted price if discount is available
			let itemPrice = item.product.price;
			
			// If discount is present, calculate discounted price
			if (item.discount) {
				const discount = item.discount;
				if (discount.valueType === DiscountValueType.PERCENTAGE) {
					const discountAmount = (item.product.price * discount.discountValue) / 100;
					itemPrice = item.product.price - discountAmount;
				} else if (discount.valueType === DiscountValueType.FIXED_AMOUNT) {
					itemPrice = Math.max(0, item.product.price - discount.discountValue);
				}
			}
			
			return total + itemPrice * item.quantity;
		}, 0);
	}

	/**
	 * Check if cart is empty
	 */
	isEmpty(): boolean {
		return this.cartItemsSubject.value.length === 0;
	}

	/**
	 * Get cart item by product ID
	 */
	getCartItem(productId: number): CartItem | undefined {
		return this.cartItemsSubject.value.find(
			(item) => item.product.id === productId
		);
	}

	/**
	 * Update cart and persist to localStorage
	 */
	private updateCart(cartItems: CartItem[]): void {
		this.cartItemsSubject.next(cartItems);
		this.saveCartToStorage(cartItems);
	}

	/**
	 * Save cart to localStorage
	 */
	private saveCartToStorage(cartItems: CartItem[]): void {
		try {
			// Store only essential data to avoid circular references
			const cartData = cartItems.map((item) => ({
				productId: item.product.id,
				quantity: item.quantity,
			}));
			localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartData));
		} catch (error) {
			console.error('Error saving cart to storage:', error);
		}
	}

	/**
	 * Load cart from localStorage
	 * Note: This only loads the structure, products need to be loaded separately
	 */
	private loadCartFromStorage(): void {
		try {
			const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
			if (cartData) {
				// Cart will be restored when products are loaded
				// For now, we just ensure the storage key exists
			}
		} catch (error) {
			console.error('Error loading cart from storage:', error);
		}
	}
}

