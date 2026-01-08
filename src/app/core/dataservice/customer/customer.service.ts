import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Customer,
	CreateCustomerDto,
	UpdateCustomerDto,
} from './customer.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class CustomerService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/customers`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new customer
	 * Note: Customer is automatically created/found during order creation
	 * using findOrCreateCustomer logic
	 */
	createCustomer(customerData: CreateCustomerDto): Observable<Customer> {
		return this.http.post<Customer>(this.apiUrl, customerData);
	}

	/**
	 * Get all customers
	 */
	getCustomers(): Observable<Customer[]> {
		return this.http.get<Customer[]>(this.apiUrl);
	}

	/**
	 * Get customer by ID
	 */
	getCustomerById(id: number): Observable<Customer> {
		return this.http.get<Customer>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update customer
	 */
	updateCustomer(
		id: number,
		customerData: UpdateCustomerDto
	): Observable<Customer> {
		return this.http.patch<Customer>(`${this.apiUrl}/${id}`, customerData);
	}

	/**
	 * Delete customer
	 */
	deleteCustomer(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}

