import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Company,
	CreateCompanyDto,
	UpdateCompanyDto,
} from './company.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class CompanyService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/company`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new company
	 * POST /company
	 */
	createCompany(companyData: CreateCompanyDto): Observable<Company> {
		return this.http.post<Company>(this.apiUrl, companyData);
	}

	/**
	 * Get the active company details
	 * GET /company
	 */
	getCompany(): Observable<Company> {
		return this.http.get<Company>(this.apiUrl);
	}

	/**
	 * Get all company records
	 * GET /company/all
	 */
	getAllCompanies(): Observable<Company[]> {
		return this.http.get<Company[]>(`${this.apiUrl}/all`);
	}

	/**
	 * Update company details
	 * PATCH /company
	 */
	updateCompany(companyData: UpdateCompanyDto): Observable<Company> {
		return this.http.patch<Company>(this.apiUrl, companyData);
	}

	/**
	 * Delete company
	 * DELETE /company
	 */
	deleteCompany(): Observable<void> {
		return this.http.delete<void>(this.apiUrl);
	}
}

