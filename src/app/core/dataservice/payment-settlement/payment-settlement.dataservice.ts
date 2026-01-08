import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { BASEAPI_URL } from '../../constants/constants';
import {
	ClientInitiatePaymentDTO,
	PaymentInitiationResponseDTO,
	AERequestDTO,
	ClientECMessage,
	DRRequestDTO,
	ClientDebitSuccessDTO,
	ErrorResponse,
	ClientInitiatePaymentUseSessionDTO,
	PaymentStatus,
	BFSResponseCodes,
} from './payment-settlement.interface';

@Injectable({
	providedIn: 'root',
})
export class PaymentSettlementDataService {
	private readonly apiUrl = `${BASEAPI_URL}/payment-settlement`;

	private httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json',
		}),
	};

	// Payment state management
	private paymentStateSubject = new BehaviorSubject<PaymentStatus | null>(null);
	public paymentState$ = this.paymentStateSubject.asObservable();

	private currentTransactionSubject = new BehaviorSubject<PaymentInitiationResponseDTO | null>(null);
	public currentTransaction$ = this.currentTransactionSubject.asObservable();

	constructor(private http: HttpClient) {}

	/**
	 * Step 1: Initiate Payment
	 * POST /payment-settlement/initiate-payment
	 * This starts the payment flow and returns bank list and transaction details
	 */
	initiatePayment(
		paymentData: ClientInitiatePaymentDTO
	): Observable<PaymentInitiationResponseDTO | ErrorResponse> {
		this.paymentStateSubject.next(PaymentStatus.INITIATED);
		return this.http
			.post<PaymentInitiationResponseDTO | ErrorResponse>(
				`${this.apiUrl}/initiate-payment`,
				paymentData,
				this.httpOptions
			)
			.pipe(
				tap((response) => {
					if (!('statusCode' in response)) {
						this.currentTransactionSubject.next(response as PaymentInitiationResponseDTO);
						console.log('Payment initiated:', response);
					}
				}),
				catchError(this.handleError)
			);
	}

	/**
	 * Initiate payment process - use session
	 * This starts the payment flow and returns bank list and transaction details
	 */
	initiatePaymentUsingSessionScreening(
		paymentData: ClientInitiatePaymentUseSessionDTO
	): Observable<PaymentInitiationResponseDTO | ErrorResponse> {
		return this.http
			.post<PaymentInitiationResponseDTO | ErrorResponse>(
				`${this.apiUrl}/initiate-payment/session`,
				paymentData
			)
			.pipe(
				catchError((error) => {
					console.error('Error initiating payment:', error);
					return throwError(() => error);
				})
			);
	}

	/**
	 * Step 2: Account Enquiry (Validate Account)
	 * POST /payment-settlement/ae-request
	 * This validates the account number and bank details
	 */
	sendAERequest(
		aeData: AERequestDTO
	): Observable<ClientECMessage | ErrorResponse> {
		return this.http
			.post<ClientECMessage | ErrorResponse>(
				`${this.apiUrl}/ae-request`,
				aeData,
				this.httpOptions
			)
			.pipe(
				tap((response) => {
					if (!('statusCode' in response)) {
						const ecMessage = response as ClientECMessage;
						if (ecMessage.status === 'OK') {
							this.paymentStateSubject.next(PaymentStatus.ACCOUNT_VALIDATED);
						}
						console.log('Account validated:', response);
					}
				}),
				catchError(this.handleError)
			);
	}

	/**
	 * Step 3: Debit Request (Complete Payment with OTP)
	 * POST /payment-settlement/dr-request
	 * This processes the final payment with OTP validation
	 */
	sendDRRequest(
		drData: DRRequestDTO
	): Observable<ClientDebitSuccessDTO | ErrorResponse> {
		return this.http
			.post<ClientDebitSuccessDTO | ErrorResponse>(
				`${this.apiUrl}/dr-request`,
				drData,
				this.httpOptions
			)
			.pipe(
				tap((response) => {
					if (!('statusCode' in response) || typeof (response as any).statusCode === 'string') {
						const successResponse = response as ClientDebitSuccessDTO;
						if (BFSResponseCodes.isSuccess(successResponse.statusCode)) {
							this.paymentStateSubject.next(PaymentStatus.COMPLETED);
						} else {
							this.paymentStateSubject.next(PaymentStatus.FAILED);
						}
						console.log('Payment completed:', response);
					}
				}),
				catchError(this.handleError)
			);
	}

	/**
	 * Get current payment transaction
	 */
	getCurrentTransaction(): PaymentInitiationResponseDTO | null {
		return this.currentTransactionSubject.value;
	}

	/**
	 * Get current payment state
	 */
	getCurrentPaymentState(): PaymentStatus | null {
		return this.paymentStateSubject.value;
	}

	/**
	 * Reset payment state
	 */
	resetPaymentState(): void {
		this.paymentStateSubject.next(null);
		this.currentTransactionSubject.next(null);
	}

	/**
	 * Handle HTTP errors
	 */
	private handleError = (error: HttpErrorResponse): Observable<never> => {
		let errorMessage = 'An unknown error occurred!';
		let errorDetails: any = null;

		if (error.error instanceof ErrorEvent) {
			// Client-side error
			errorMessage = `Error: ${error.error.message}`;
		} else {
			// Server-side error
			const apiError: ErrorResponse = error.error;

			if (apiError && apiError.message) {
				errorMessage = apiError.message;
				errorDetails = apiError.details;
			} else {
				errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
			}

			// Update payment state on error
			if (error.status >= 400 && error.status < 500) {
				this.paymentStateSubject.next(PaymentStatus.FAILED);
			}
		}

		console.error('Payment Service Error:', {
			status: error.status,
			message: errorMessage,
			details: errorDetails,
			error: error.error,
		});

		return throwError(() => ({
			status: error.status,
			message: errorMessage,
			details: errorDetails,
			originalError: error,
		}));
	};
}
