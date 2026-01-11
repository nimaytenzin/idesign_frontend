import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
	AuthState,
	LoginDto,
	LoginResponse,
	ChangePasswordDto,
	ChangePasswordResponse,
	ResetPasswordDto,
	ResetPasswordResponse,
	SignOutResponse,
	ApiError,
	AdminResetPasswordDto,
} from './auth.interface';
import { UserRole } from '../../constants/enums';
import { BASEAPI_URL } from '../../constants/constants';
import { User } from '../user/user.interface';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private readonly apiUrl = BASEAPI_URL + '/auth';
	private readonly TOKEN_KEY = 'auth_token';
	private readonly USER_KEY = 'auth_user';

	private authStateSubject = new BehaviorSubject<AuthState>({
		isAuthenticated: false,
		user: null,
		token: null,
	});

	public authState$ = this.authStateSubject.asObservable();

	constructor(
		private http: HttpClient,
		private router: Router
	) {
		this.initializeAuthState();
	}

	/**
	 * Initialize authentication state from localStorage
	 */
	private initializeAuthState(): void {
		const token = this.getStoredToken();
		const user = this.getStoredUser();

		if (token && user) {
			this.authStateSubject.next({
				isAuthenticated: true,
				user,
				token,
			});
		}
	}

	/**
	 * Login user with email and password
	 * @param loginDto - Login credentials
	 * @returns Observable<LoginResponse>
	 */
	login(loginDto: LoginDto): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginDto).pipe(
			tap((response) => {
				if (response.token && response.user) {
					this.setAuthData(response.token, response.user);
					this.authStateSubject.next({
						isAuthenticated: true,
						user: response.user,
						token: response.token,
					});
				}
			}),
			catchError(this.handleError)
		);
	}

	/**
	 * Logout user
	 * @returns Observable<SignOutResponse>
	 */
	logout(): Observable<SignOutResponse> {
		return this.http.post<SignOutResponse>(`${this.apiUrl}/signout`, {}).pipe(
			tap(() => {
				this.clearAuthData();
				this.router.navigate(['/auth/login']);
			}),
			catchError((error) => {
				// Even if API call fails, clear local auth data
				this.clearAuthData();
				this.router.navigate(['/auth/login']);
				return throwError(() => error);
			})
		);
	}

	/**
	 * Force logout without server call (for token expiration, etc.)
	 */
	forceLogout(): void {
		this.clearAuthData();
		this.router.navigate(['/auth/login']);
	}

	/**
	 * Check if user is authenticated
	 * @returns boolean
	 */
	isAuthenticated(): boolean {
		return this.authStateSubject.value.isAuthenticated;
	}

	/**
	 * Get current user
	 * @returns User | null
	 */
	getCurrentUser(): User | null {
		return this.authStateSubject.value.user;
	}

	/**
	 * Get current token
	 * @returns string | null
	 */
	getToken(): string | null {
		return this.authStateSubject.value.token;
	}

	/**
	 * Check if user has specific role
	 * @param role - UserRole
	 * @returns boolean
	 */
	hasRole(role: UserRole): boolean {
		const user = this.getCurrentUser();
		return user ? user.role === role : false;
	}

	/**
	 * Check if user has any of the specified roles
	 * @param roles - Array of UserRole
	 * @returns boolean
	 */
	hasAnyRole(roles: UserRole[]): boolean {
		const user = this.getCurrentUser();
		return user ? roles.includes(user.role) : false;
	}

	/**
	 * Check if user is admin
	 * @returns boolean
	 */
	isAdmin(): boolean {
		return this.hasRole(UserRole.ADMIN);
	}

	/**
	 * Check if user is staff
	 * @returns boolean
	 */
	isStaff(): boolean {
		return this.hasRole(UserRole.STAFF);
	}

	/**
	 * Check if user is affiliate marketer
	 * @returns boolean
	 */
	isAffiliateMarketer(): boolean {
		return this.hasRole(UserRole.AFFILIATE_MARKETER);
	}

	/**
	 * Get authenticated user's profile
	 * @returns Observable<User>
	 */
	getProfile(): Observable<User> {
		return this.http.get<User>(`${this.apiUrl}/me`).pipe(
			tap((user) => {
				// Update stored user data if profile is different
				const currentUser = this.getCurrentUser();
				if (currentUser && currentUser.id === user.id) {
					this.setAuthData(this.getToken() || '', user);
					this.authStateSubject.next({
						isAuthenticated: true,
						user,
						token: this.getToken(),
					});
				}
			}),
			catchError(this.handleError)
		);
	}

	/**
	 * Change password for authenticated user
	 * @param changePasswordDto - Change password data
	 * @returns Observable<ChangePasswordResponse>
	 */
	changePassword(changePasswordDto: ChangePasswordDto): Observable<ChangePasswordResponse> {
		return this.http.post<ChangePasswordResponse>(
			`${this.apiUrl}/change-password`,
			changePasswordDto
		).pipe(catchError(this.handleError));
	}

	/**
	 * Reset password using reset token
	 * @param resetPasswordDto - Reset password data
	 * @returns Observable<ResetPasswordResponse>
	 */
	resetPassword(resetPasswordDto: ResetPasswordDto): Observable<ResetPasswordResponse> {
		return this.http.post<ResetPasswordResponse>(
			`${this.apiUrl}/reset-password`,
			resetPasswordDto
		).pipe(catchError(this.handleError));
	}

	/**
	 * Store authentication data
	 * @param token - JWT token
	 * @param user - User data
	 */
	private setAuthData(token: string, user: User): void {
		try {
			localStorage.setItem(this.TOKEN_KEY, token);
			localStorage.setItem(this.USER_KEY, JSON.stringify(user));
		} catch (error) {
			console.error('Error storing auth data:', error);
		}
	}

	/**
	 * Clear authentication data
	 */
	private clearAuthData(): void {
		try {
			localStorage.removeItem(this.TOKEN_KEY);
			localStorage.removeItem(this.USER_KEY);

			this.authStateSubject.next({
				isAuthenticated: false,
				user: null,
				token: null,
			});
		} catch (error) {
			console.error('Error clearing auth data:', error);
		}
	}

	/**
	 * Handle HTTP errors
	 * @param error - HttpErrorResponse
	 * @returns Observable<never>
	 */
	private handleError(error: HttpErrorResponse): Observable<never> {
		let errorMessage = 'An unexpected error occurred';

		if (error.error instanceof ErrorEvent) {
			// Client-side error
			errorMessage = `Error: ${error.error.message}`;
		} else {
			// Server-side error
			if (error.error && error.error.message) {
				errorMessage = error.error.message;
			} else {
				switch (error.status) {
					case 400:
						errorMessage = 'Bad request. Please check your input.';
						break;
					case 401:
						errorMessage = 'Invalid credentials. Please try again.';
						break;
					case 403:
						errorMessage = 'Access denied. Please contact support.';
						break;
					case 404:
						errorMessage = 'Service not found.';
						break;
					case 500:
						errorMessage = 'Server error. Please try again later.';
						break;
					default:
						errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
				}
			}
		}

		console.error('Auth Service Error:', error);

		// Return an observable with the error
		return throwError(
			() =>
				({
					statusCode: error.status || 500,
					message: errorMessage,
					error: error.error,
				} as ApiError)
		);
	}

	/**
	 * Get stored token
	 * @returns string | null
	 */
	private getStoredToken(): string | null {
		try {
			return localStorage.getItem(this.TOKEN_KEY);
		} catch (error) {
			console.error('Error getting stored token:', error);
			return null;
		}
	}

	/**
	 * Get stored user
	 * @returns User | null
	 */
	private getStoredUser(): User | null {
		try {
			const userStr = localStorage.getItem(this.USER_KEY);
			return userStr ? JSON.parse(userStr) : null;
		} catch (error) {
			console.error('Error getting stored user:', error);
			return null;
		}
	}

 

	 adminResetPassword(adminResetPasswordDto: AdminResetPasswordDto): Observable<ResetPasswordResponse> {
		return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/users/reset-password`, adminResetPasswordDto).pipe(catchError(this.handleError));
	 }
   
}
