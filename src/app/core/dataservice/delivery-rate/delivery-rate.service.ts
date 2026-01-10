import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	DeliveryRate,
	CreateDeliveryRateDto,
	UpdateDeliveryRateDto,
} from './delivery-rate.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class DeliveryRateService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/delivery-rates`;

	constructor(private http: HttpClient) {}

	// Get all delivery rates
	getDeliveryRates(): Observable<DeliveryRate[]> {
		return this.http.get<DeliveryRate[]>(this.apiUrl);
	}

	// Get single delivery rate by ID
	getDeliveryRateById(id: number): Observable<DeliveryRate> {
		return this.http.get<DeliveryRate>(`${this.apiUrl}/${id}`);
	}

	// Create new delivery rate
	createDeliveryRate(data: CreateDeliveryRateDto): Observable<DeliveryRate> {
		return this.http.post<DeliveryRate>(this.apiUrl, data);
	}

	// Update delivery rate
	updateDeliveryRate(
		id: number,
		data: UpdateDeliveryRateDto
	): Observable<DeliveryRate> {
		return this.http.patch<DeliveryRate>(`${this.apiUrl}/${id}`, data);
	}

	// Delete delivery rate
	deleteDeliveryRate(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
