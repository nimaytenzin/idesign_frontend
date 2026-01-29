import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	PaymentReceipt,
	CreatePaymentReceiptDto,
} from './payment-receipt.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class PaymentReceiptService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/payment-receipts`;

	constructor(private http: HttpClient) {}

	create(dto: CreatePaymentReceiptDto): Observable<PaymentReceipt> {
		return this.http.post<PaymentReceipt>(this.apiUrl, dto);
	}

	getByOrderId(orderId: number): Observable<PaymentReceipt[]> {
		return this.http.get<PaymentReceipt[]>(
			`${this.apiUrl}/order/${orderId}`
		);
	}

	getById(id: number): Observable<PaymentReceipt> {
		return this.http.get<PaymentReceipt>(`${this.apiUrl}/${id}`);
	}
}
