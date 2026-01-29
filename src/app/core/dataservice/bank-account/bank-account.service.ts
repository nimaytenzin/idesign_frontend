import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	BankAccount,
	CreateBankAccountDto,
	UpdateBankAccountDto,
} from './bank-account.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class BankAccountService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/bank-accounts`;

	constructor(private http: HttpClient) {}

	create(data: CreateBankAccountDto): Observable<BankAccount> {
		return this.http.post<BankAccount>(this.apiUrl, data);
	}

	getAll(activeOnly?: boolean): Observable<BankAccount[]> {
		let params = new HttpParams();
		if (activeOnly === true) {
			params = params.set('activeOnly', 'true');
		}
		return this.http.get<BankAccount[]>(this.apiUrl, { params });
	}

	getRmaPg(): Observable<BankAccount> {
		return this.http.get<BankAccount>(`${this.apiUrl}/rma-pg`);
	}

	getById(id: number): Observable<BankAccount> {
		return this.http.get<BankAccount>(`${this.apiUrl}/${id}`);
	}

	update(id: number, data: UpdateBankAccountDto): Observable<BankAccount> {
		return this.http.patch<BankAccount>(`${this.apiUrl}/${id}`, data);
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
