import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	DeliveryLocation,
	CreateDeliveryLocationDto,
	UpdateDeliveryLocationDto,
} from './delivery-location.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class DeliveryLocationService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/delivery-locations`;

	constructor(private http: HttpClient) {}

	// Get all delivery locations
	getLocations(): Observable<DeliveryLocation[]> {
		return this.http.get<DeliveryLocation[]>(this.apiUrl);
	}

	// Get all delivery locations with rates
	getLocationsWithRates(): Observable<DeliveryLocation[]> {
		return this.http.get<DeliveryLocation[]>(`${this.apiUrl}/with-rates`);
	}

	// Get single delivery location by ID
	getLocationById(id: number): Observable<DeliveryLocation> {
		return this.http.get<DeliveryLocation>(`${this.apiUrl}/${id}`);
	}

	// Create new delivery location
	createLocation(data: CreateDeliveryLocationDto): Observable<DeliveryLocation> {
		return this.http.post<DeliveryLocation>(this.apiUrl, data);
	}

	// Update delivery location
	updateLocation(
		id: number,
		data: UpdateDeliveryLocationDto
	): Observable<DeliveryLocation> {
		return this.http.patch<DeliveryLocation>(`${this.apiUrl}/${id}`, data);
	}

	// Delete delivery location
	deleteLocation(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
