import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
	ChartOfAccounts,
	CreateChartOfAccountsDto,
	UpdateChartOfAccountsDto,
	AccountType,
} from './chart-of-accounts.interface';

@Injectable({
	providedIn: 'root',
})
export class ChartOfAccountsService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/chart-of-accounts`;

	// Cache for accounts list
	private accountsSubject = new BehaviorSubject<ChartOfAccounts[]>([]);
	public accounts$ = this.accountsSubject.asObservable();

	constructor(private http: HttpClient) {
		// Load accounts on service initialization
		this.loadAccounts();
	}

	/**
	 * Create a new account
	 * POST /chart-of-accounts
	 */
	createAccount(
		createDto: CreateChartOfAccountsDto
	): Observable<ChartOfAccounts> {
		return this.http
			.post<ChartOfAccounts>(this.apiUrl, createDto)
			.pipe(
				tap((account) => {
					// Add to cache
					const current = this.accountsSubject.value;
					this.accountsSubject.next(
						[...current, account].sort((a, b) =>
							a.accountCode.localeCompare(b.accountCode)
						)
					);
				}),
				catchError((error) => {
					throw error;
				})
			);
	}

	/**
	 * Get all accounts
	 * GET /chart-of-accounts
	 */
	getAllAccounts(): Observable<ChartOfAccounts[]> {
		return this.http.get<ChartOfAccounts[]>(this.apiUrl).pipe(
			tap((accounts) => {
				// Update cache
				this.accountsSubject.next(accounts);
			}),
			catchError((error) => {
				throw error;
			})
		);
	}

	/**
	 * Load accounts and update cache
	 */
	loadAccounts(): void {
		this.getAllAccounts().subscribe({
			error: (err) => console.error('Failed to load accounts:', err),
		});
	}

	/**
	 * Get account by code
	 * GET /chart-of-accounts/:accountCode
	 */
	getAccountByCode(accountCode: string): Observable<ChartOfAccounts> {
		return this.http.get<ChartOfAccounts>(
			`${this.apiUrl}/${accountCode}`
		);
	}

	/**
	 * Update account
	 * PATCH /chart-of-accounts/:accountCode
	 */
	updateAccount(
		accountCode: string,
		updateDto: UpdateChartOfAccountsDto
	): Observable<ChartOfAccounts> {
		return this.http
			.patch<ChartOfAccounts>(`${this.apiUrl}/${accountCode}`, updateDto)
			.pipe(
				tap((updatedAccount) => {
					// Update cache
					const current = this.accountsSubject.value;
					const index = current.findIndex(
						(a) => a.accountCode === accountCode
					);
					if (index !== -1) {
						current[index] = updatedAccount;
						this.accountsSubject.next([...current]);
					}
				}),
				catchError((error) => {
					throw error;
				})
			);
	}

	/**
	 * Delete account
	 * DELETE /chart-of-accounts/:accountCode
	 */
	deleteAccount(accountCode: string): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${accountCode}`).pipe(
			tap(() => {
				// Remove from cache
				const current = this.accountsSubject.value;
				this.accountsSubject.next(
					current.filter((a) => a.accountCode !== accountCode)
				);
			}),
			catchError((error) => {
				throw error;
			})
		);
	}

	/**
	 * Get accounts by type
	 */
	getAccountsByType(type: AccountType): Observable<ChartOfAccounts[]> {
		return this.accounts$.pipe(
			map((accounts) =>
				accounts.filter((a) => a.accountType === type && a.isActive)
			)
		);
	}

	/**
	 * Get active accounts only
	 */
	getActiveAccounts(): Observable<ChartOfAccounts[]> {
		return this.accounts$.pipe(
			map((accounts) => accounts.filter((a) => a.isActive))
		);
	}

	/**
	 * Search accounts by name or code
	 */
	searchAccounts(query: string): Observable<ChartOfAccounts[]> {
		const lowerQuery = query.toLowerCase();
		return this.accounts$.pipe(
			map((accounts) =>
				accounts.filter(
					(a) =>
						a.accountCode.toLowerCase().includes(lowerQuery) ||
						a.accountName.toLowerCase().includes(lowerQuery)
				)
			)
		);
	}

	/**
	 * Get cached accounts (synchronous)
	 */
	getCachedAccounts(): ChartOfAccounts[] {
		return this.accountsSubject.value;
	}
}

