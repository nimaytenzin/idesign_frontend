import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	CompanyService,
	CreateCompanyServiceDto,
	UpdateCompanyServiceDto,
} from './company-service.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class CompanyServiceService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/company-services`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new company service with image upload
	 * @param formData FormData containing image file and service data
	 * @returns Observable<CompanyServiceEntity>
	 */
	createCompanyService(formData: FormData): Observable<CompanyService> {
		return this.http.post<CompanyService>(this.apiUrl, formData);
	}

	/**
	 * Create a new company service without file upload (for simple data)
	 * @param serviceData Service data without file
	 * @returns Observable<CompanyServiceEntity>
	 */
	createCompanyServiceSimple(
		serviceData: CreateCompanyServiceDto
		): Observable<CompanyService> {
		return this.http.post<CompanyService>(this.apiUrl, serviceData);
	}

	/**
	 * Get all company services
	 * @returns Observable<CompanyServiceEntity[]>
	 */
	getAllCompanyServices(): Observable<CompanyService[]> {
		return this.http.get<CompanyService[]>(this.apiUrl);
	}

	/**
	 * Get active company services only
	 * @returns Observable<CompanyServiceEntity[]>
	 */
	getActiveCompanyServices(): Observable<CompanyService[]> {
		return this.http.get<CompanyService[]>(this.apiUrl).pipe(
			// Filter active services on the client side
			// Note: Backend should ideally support ?isActive=true query param
			map((services) => services.filter((s) => s.isActive))
		);
	}

	/**
	 * Get a single company service by ID
	 * @param id Service ID
	 * @returns Observable<CompanyServiceEntity>
	 */
	getCompanyServiceById(id: number): Observable<CompanyService> {
		return this.http.get<CompanyService>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update a company service (with optional image upload)
	 * @param id Service ID
	 * @param formData FormData containing optional image file and service data
	 * @returns Observable<CompanyServiceEntity>
	 */
	updateCompanyService(
		id: number,
		formData: FormData
	): Observable<CompanyService> {
		return this.http.patch<CompanyService>(
			`${this.apiUrl}/${id}`,
			formData
		);
	}

	/**
	 * Update a company service without file upload
	 * @param id Service ID
	 * @param serviceData Service data without file
	 * @returns Observable<CompanyServiceEntity>
	 */
	updateCompanyServiceSimple(
		id: number,
		serviceData: UpdateCompanyServiceDto
	): Observable<CompanyService> {
		return this.http.patch<CompanyService>(
			`${this.apiUrl}/${id}`,
			serviceData
		);
	}

	/**
	 * Delete a company service
	 * @param id Service ID
	 * @returns Observable<void>
	 */
	deleteCompanyService(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}

