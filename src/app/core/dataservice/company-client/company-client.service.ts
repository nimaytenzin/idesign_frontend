import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	CompanyClient,
	CreateCompanyClientDto,
	UpdateCompanyClientDto,
} from './company-client.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class CompanyClientService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/company-clients`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new company client with logo upload
	 * @param formData FormData containing logo file and client data
	 * @returns Observable<CompanyClient>
	 */
	createCompanyClient(formData: FormData): Observable<CompanyClient> {
		return this.http.post<CompanyClient>(this.apiUrl, formData);
	}

	/**
	 * Create a new company client without file upload (for simple data)
	 * @param clientData Client data without file
	 * @returns Observable<CompanyClient>
	 */
	createCompanyClientSimple(
		clientData: CreateCompanyClientDto
	): Observable<CompanyClient> {
		return this.http.post<CompanyClient>(this.apiUrl, clientData);
	}

	/**
	 * Get all company clients
	 * @returns Observable<CompanyClient[]>
	 */
	getAllCompanyClients(): Observable<CompanyClient[]> {
		return this.http.get<CompanyClient[]>(this.apiUrl);
	}

	/**
	 * Get a single company client by ID
	 * @param id Client ID
	 * @returns Observable<CompanyClient>
	 */
	getCompanyClientById(id: number): Observable<CompanyClient> {
		return this.http.get<CompanyClient>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update a company client (with optional logo upload)
	 * @param id Client ID
	 * @param formData FormData containing optional logo file and client data
	 * @returns Observable<CompanyClient>
	 */
	updateCompanyClient(
		id: number,
		formData: FormData
	): Observable<CompanyClient> {
		return this.http.patch<CompanyClient>(`${this.apiUrl}/${id}`, formData);
	}

	/**
	 * Update a company client without file upload
	 * @param id Client ID
	 * @param clientData Client data without file
	 * @returns Observable<CompanyClient>
	 */
	updateCompanyClientSimple(
		id: number,
		clientData: UpdateCompanyClientDto
	): Observable<CompanyClient> {
		return this.http.patch<CompanyClient>(
			`${this.apiUrl}/${id}`,
			clientData
		);
	}

	/**
	 * Delete a company client
	 * @param id Client ID
	 * @returns Observable<void>
	 */
	deleteCompanyClient(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}

