// Customer Interfaces
export interface Customer {
	id: number;
	name?: string;
	email?: string;
	phoneNumber?: string;
	shippingAddress?: string;
	billingAddress?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateCustomerDto {
	name?: string;
	email?: string;
	phoneNumber?: string;
	shippingAddress?: string;
	billingAddress?: string;
}

export interface UpdateCustomerDto {
	name?: string;
	email?: string;
	phoneNumber?: string;
	shippingAddress?: string;
	billingAddress?: string;
}

