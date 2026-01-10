import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
	FormsModule,
	ReactiveFormsModule,
	FormBuilder,
	FormGroup,
	Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrderService } from '../../../core/dataservice/order/order.service';
import {
	PaymentSettlementDataService,
} from '../../../core/dataservice/payment-settlement/payment-settlement.dataservice';
import {
	PGBank,
	AERequestDTO,
	ClientECMessage,
	ErrorResponse,
	DRRequestDTO,
	ClientDebitSuccessDTO,
	BFSResponseCodes,
} from '../../../core/dataservice/payment-settlement/payment-settlement.interface';
import { FulfillmentStatus } from '../../../core/constants/enums';
import { Order } from '../../../core/dataservice';

@Component({
	selector: 'app-public-order-payment',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ButtonModule,
		CardModule,
		InputTextModule,
		ProgressSpinnerModule,
		DropdownModule,
		ToastModule,
	],
	providers: [MessageService],
	templateUrl: './public-order-payment.component.html',
	styleUrls: ['./public-order-payment.component.scss'],
})
export class PublicOrderPaymentComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	orderId: number | null = null;
	order: Order | null = null;
	loading = true;
	loadingOrder = true;

	// Payment flow state
	currentStep: 'initiate' | 'bank' | 'account' | 'otp' = 'initiate';
	activeStep = 1; // 1: Initiate, 2: Bank Selection, 3: Account Entry, 4: OTP

	// Payment form
	paymentForm: FormGroup;

	// Payment processing states
	initiatingPayment = false;
	validatingAccount = false;
	completingPayment = false;

	// Payment data
	banks: PGBank[] = [];
	selectedBank: PGBank | null = null;
	accountNumber = '';
	otpCode = '';
	bfsTransactionId = '';
	paymentInstructionNumber = '';
	amount = 0;

	// OTP countdown
	otpSent = false;
	countdown = 0;
	countdownInterval: any;

	// Session timeout
	paymentSessionTimeout = 10 * 60; // 10 minutes in seconds
	sessionTimer: any = null;
	sessionExpired = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private fb: FormBuilder,
		private messageService: MessageService,
		private orderService: OrderService,
		private paymentService: PaymentSettlementDataService
	) {
		this.paymentForm = this.fb.group({
			selectedBank: ['', Validators.required],
			accountNumber: ['', [Validators.required, Validators.minLength(8)]],
			otpCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
		});
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			this.orderId = params['orderId'] ? Number(params['orderId']) : null;
			if (this.orderId) {
				this.loadOrderDetails();
			} else {
				this.loading = false;
				this.loadingOrder = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Invalid Order',
					detail: 'Order ID is required to proceed with payment.',
				});
			}
		});

		// Start payment session timer
		this.startPaymentSessionTimer();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();

		if (this.sessionTimer) {
			clearTimeout(this.sessionTimer);
		}

		if (this.countdownInterval) {
			clearInterval(this.countdownInterval);
		}
	}

	loadOrderDetails() {
		if (!this.orderId) return;

		// this.orderService.getOrderById(this.orderId).subscribe({
		// 	next: (order) => {
		// 		this.order = order;
		// 		// Ensure amount is always a number
		// 		this.amount = typeof order.totalAmount === 'string' 
		// 			? parseFloat(order.totalAmount) 
		// 			: Number(order.totalAmount);
		// 		this.loadingOrder = false;
		// 		this.loading = false;

		// 		// Check if order is already paid or completed
		// 		if (order.fulfillmentStatus === FulfillmentStatus.DELIVERED) {
		// 			this.messageService.add({
		// 				severity: 'info',
		// 				summary: 'Order Already Paid',
		// 				detail: 'This order has already been paid.',
		// 			});
		// 			this.router.navigate(['/order-confirmation'], {
		// 				queryParams: { orderId: this.orderId },
		// 			});
		// 			return;
		// 		}

		// 		// Check if order is confirmed
		// 		if (order.fulfillmentStatus !== 'CONFIRMED') {
		// 			this.messageService.add({
		// 				severity: 'warn',
		// 				summary: 'Order Not Ready',
		// 				detail: 'Order must be in CONFIRMED status to proceed with payment.',
		// 			});
		// 		}
		// 	},
		// 	error: (error) => {
		// 		console.error('Error loading order:', error);
		// 		this.loadingOrder = false;
		// 		this.loading = false;
		// 		this.messageService.add({
		// 			severity: 'error',
		// 			summary: 'Error Loading Order',
		// 			detail: 'Failed to load order details. Please try again.',
		// 		});
		// 	},
		// });
	}

	// Step 1: Initiate Payment
	initiatePayment() {
		if (this.sessionExpired || !this.orderId || !this.order) {
			return;
		}

		if (this.order.fulfillmentStatus !== FulfillmentStatus.PLACED) {
			this.messageService.add({
				severity: 'error',
				summary: 'Order Not Ready',
				detail: 'Order must be Placed first before  payment.',
			});
			return;
		}

		this.initiatingPayment = true;

		this.paymentService
			.initiatePayment({
				orderId: this.orderId,
				amount: Number(this.amount), // Ensure amount is always a number
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.initiatingPayment = false;

					// Check if response is an error
					if ('statusCode' in response && response.statusCode >= 400) {
						const errorResponse = response as ErrorResponse;
						this.messageService.add({
							severity: 'error',
							summary: 'Payment Initiation Failed',
							detail: errorResponse.message || 'Failed to initiate payment.',
						});
						return;
					}

					// Success - store transaction details
					const initResponse = response as any;
					this.banks = initResponse.bankList || [];
					this.bfsTransactionId = initResponse.bfsTransactionId || '';
					this.paymentInstructionNumber =
						initResponse.paymentInstructionNumber || '';

					if (this.banks.length === 0) {
						this.messageService.add({
							severity: 'warn',
							summary: 'No Banks Available',
							detail: 'No banks are currently available for payment.',
						});
						return;
					}

					// Move to bank selection step
					this.activeStep = 2;
					this.currentStep = 'bank';

					this.messageService.add({
						severity: 'success',
						summary: 'Payment Initiated',
						detail: 'Please select your bank to continue.',
					});
				},
				error: (error) => {
					this.initiatingPayment = false;
					console.error('Error initiating payment:', error);
					this.messageService.add({
						severity: 'error',
						summary: 'Payment Initiation Failed',
						detail:
							error.message ||
							'Failed to initiate payment. Please try again.',
					});
				},
			});
	}

	// Step 2: Select Bank
	selectBank(bank: PGBank) {
		this.selectedBank = bank;
		this.paymentForm.patchValue({ selectedBank: bank });
	}

	goToAccountStep() {
		if (!this.selectedBank) {
			this.messageService.add({
				severity: 'error',
				summary: 'Bank Required',
				detail: 'Please select a bank to continue.',
			});
			return;
		}

		this.activeStep = 3;
		this.currentStep = 'account';
	}

	// Step 3: Validate Account
	validateAccount() {
		if (this.sessionExpired) {
			return;
		}

		if (!this.selectedBank || !this.bfsTransactionId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Missing Information',
				detail: 'Bank selection or transaction ID is missing.',
			});
			return;
		}

		const accountNumber = this.paymentForm.get('accountNumber')?.value;
		if (!accountNumber || accountNumber.length < 8) {
			this.messageService.add({
				severity: 'error',
				summary: 'Invalid Account Number',
				detail: 'Please enter a valid account number.',
			});
			return;
		}

		this.validatingAccount = true;

		const aeRequestData: AERequestDTO = {
			bfsTransactionId: this.bfsTransactionId,
			bankCode: this.selectedBank.bankCode,
			accountNumber: accountNumber,
		};

		this.paymentService
			.sendAERequest(aeRequestData)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.validatingAccount = false;

					// Check if response is an error
					if ('statusCode' in response && response.statusCode >= 400) {
						const errorResponse = response as ErrorResponse;
						this.messageService.add({
							severity: 'error',
							summary: 'Account Validation Failed',
							detail:
								errorResponse.message ||
								'Unable to validate account details.',
						});
						return;
					}

					// Success - proceed to OTP step
					const ecMessage = response as ClientECMessage;
					if (ecMessage.status === 'OK') {
						this.accountNumber = accountNumber;
						this.activeStep = 4;
						this.currentStep = 'otp';
						this.sendOTP();
					} else {
						this.messageService.add({
							severity: 'error',
							summary: 'Account Validation Failed',
							detail: 'Unable to validate account details.',
						});
					}
				},
				error: (error) => {
					this.validatingAccount = false;
					console.error('AE Request error:', error);
					this.messageService.add({
						severity: 'error',
						summary: 'Validation Error',
						detail: 'Failed to validate account details. Please try again.',
					});
				},
			});
	}

	// Step 4: Complete Payment with OTP
	completePayment() {
		if (this.sessionExpired) {
			return;
		}

		const otpCode = this.paymentForm.get('otpCode')?.value;
		if (!otpCode || otpCode.length !== 6) {
			this.messageService.add({
				severity: 'error',
				summary: 'Invalid OTP',
				detail: 'Please enter a valid 6-digit OTP.',
			});
			return;
		}

		this.completingPayment = true;

		const drRequestData: DRRequestDTO = {
			bfsTransactionId: this.bfsTransactionId,
			otp: otpCode,
		};

		this.paymentService
			.sendDRRequest(drRequestData)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.completingPayment = false;

					// Check if response is an ErrorResponse
					if (
						'statusCode' in response &&
						typeof response.statusCode === 'number' &&
						response.statusCode >= 400
					) {
						const errorResponse = response as ErrorResponse;
						this.messageService.add({
							severity: 'error',
							summary: 'Payment Failed',
							detail:
								errorResponse.message || 'Payment could not be processed.',
						});
						this.handlePaymentFailure();
						return;
					}

					// Check if it's a ClientDebitSuccessDTO
					const successResponse = response as ClientDebitSuccessDTO;
					if (BFSResponseCodes.isSuccess(successResponse.statusCode)) {
						// Payment successful - now update order status
						this.clearPaymentSessionTimer();
						
						// Update order payment status via order service
						// This triggers PLACED_TO_CONFIRMED SMS event per workflow documentation
						if (this.orderId && this.order) {
							this.orderService
								.processPayment(this.orderId, {
									paymentMethod: 'ZPSS',
									paymentDate: new Date().toISOString(),
								})
								.pipe(takeUntil(this.destroy$))
								.subscribe({
									next: (updatedOrder) => {
										this.order = updatedOrder;
						this.messageService.add({
							severity: 'success',
							summary: 'Payment Successful',
											detail: 'Your payment has been processed successfully! Order confirmed.',
							life: 5000,
						});

						// Navigate to order confirmation
						setTimeout(() => {
							this.router.navigate(['/order-confirmation'], {
								queryParams: {
									orderId: this.orderId,
									paymentSuccess: true,
								},
							});
						}, 2000);
									},
									error: (error) => {
										console.error('Error updating order status:', error);
										// Still navigate but show warning
										this.messageService.add({
											severity: 'warn',
											summary: 'Payment Processed',
											detail: 'Payment was successful but order status update failed. Please contact support.',
											life: 5000,
										});
										setTimeout(() => {
											this.router.navigate(['/order-confirmation'], {
												queryParams: {
													orderId: this.orderId,
													paymentSuccess: true,
												},
											});
										}, 2000);
									},
								});
						} else {
							// Fallback if orderId is missing
							this.messageService.add({
								severity: 'success',
								summary: 'Payment Successful',
								detail: 'Your payment has been processed successfully!',
								life: 5000,
							});
							setTimeout(() => {
								this.router.navigate(['/order-confirmation'], {
									queryParams: {
										orderId: this.orderId,
										paymentSuccess: true,
									},
								});
							}, 2000);
						}
					} else {
						// Payment failed - wrong OTP or other error
						const errorMessage =
							BFSResponseCodes.getResponseDescription(
								successResponse.statusCode
							);
						this.messageService.add({
							severity: 'error',
							summary: 'Payment Failed',
							detail: errorMessage,
						});
						this.handlePaymentFailure();
					}
				},
				error: (error) => {
					this.completingPayment = false;
					console.error('DR Request error:', error);

					let errorMessage = 'Payment failed. Please try again.';
					if (error.status === 400) {
						errorMessage = 'Invalid OTP. Please check and try again.';
					} else if (error.status === 408) {
						errorMessage = 'Payment timeout. Please try again.';
					} else if (error.message) {
						errorMessage = error.message;
					}

					this.messageService.add({
						severity: 'error',
						summary: 'Payment Error',
						detail: errorMessage,
					});
					this.handlePaymentFailure();
				},
			});
	}

	// OTP Management
	sendOTP() {
		this.otpSent = true;
		this.countdown = 60;
		this.startCountdown();

		this.messageService.add({
			severity: 'info',
			summary: 'OTP Sent',
			detail: `OTP has been sent to your registered mobile number.`,
		});
	}

	resendOTP() {
		if (this.countdown === 0) {
			this.sendOTP();
		}
	}

	startCountdown() {
		if (this.countdownInterval) {
			clearInterval(this.countdownInterval);
		}
		this.countdownInterval = setInterval(() => {
			this.countdown--;
			if (this.countdown === 0) {
				clearInterval(this.countdownInterval);
			}
		}, 1000);
	}

	// Navigation
	goToPreviousStep() {
		if (this.activeStep > 1) {
			this.activeStep--;
			if (this.activeStep === 1) {
				this.currentStep = 'initiate';
			} else if (this.activeStep === 2) {
				this.currentStep = 'bank';
			} else if (this.activeStep === 3) {
				this.currentStep = 'account';
			}
		}
	}

	// Session Management
	private startPaymentSessionTimer(): void {
		if (this.sessionTimer) {
			clearTimeout(this.sessionTimer);
		}

		this.sessionTimer = setTimeout(() => {
			this.handlePaymentSessionTimeout();
		}, this.paymentSessionTimeout * 1000);
	}

	private handlePaymentSessionTimeout(): void {
		if (this.sessionExpired) {
			return;
		}

		this.sessionExpired = true;
		this.initiatingPayment = false;
		this.validatingAccount = false;
		this.completingPayment = false;

		if (this.countdownInterval) {
			clearInterval(this.countdownInterval);
		}

		this.messageService.add({
			severity: 'warn',
			summary: 'Session Expired',
			detail: 'Your payment session has expired. Please start over.',
			life: 5000,
		});

		setTimeout(() => {
			this.router.navigate(['/order-confirmation'], {
				queryParams: { orderId: this.orderId },
			});
		}, 3000);
	}

	private clearPaymentSessionTimer(): void {
		if (this.sessionTimer) {
			clearTimeout(this.sessionTimer);
			this.sessionTimer = null;
		}
	}

	private handlePaymentFailure() {
		// Reset to account step to allow retry
		this.activeStep = 3;
		this.currentStep = 'account';
		this.paymentForm.patchValue({ otpCode: '' });
		this.otpSent = false;
		this.countdown = 0;
		if (this.countdownInterval) {
			clearInterval(this.countdownInterval);
		}
	}

	// Utility methods
	formatPrice(price: number): number {
		// Return price without formatting
		return price;
	}

	/**
	 * Get total discount for the order
	 */
	getTotalDiscount(): number {
		if (!this.order || !this.order.orderItems) {
			return 0;
		}
		return this.order.orderItems.reduce((sum, item) => {
			return sum + (item.discountApplied || 0) * item.quantity;
		}, 0);
	}

	/**
	 * Get subtotal before discount
	 */
	getSubtotal(): number {
		if (!this.order || !this.order.orderItems) {
			return 0;
		}
		return this.order.orderItems.reduce((sum, item) => {
			return sum + (item.unitPrice * item.quantity);
		}, 0);
	}

	trackByBank(index: number, bank: PGBank): string {
		return bank.bankCode;
	}

	onOtpInput(event: any): void {
		const value = event.target.value;
		const cleanValue = value.replace(/\D/g, '').slice(0, 6);
		this.paymentForm.patchValue({ otpCode: cleanValue });

		// Auto-submit when 6 digits are entered
		if (cleanValue.length === 6 && !this.completingPayment) {
			setTimeout(() => {
				this.completePayment();
			}, 300);
		}
	}

	onAccountNumberInput(event: any): void {
		const value = event.target.value;
		const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
		this.paymentForm.patchValue({ accountNumber: cleanValue });
	}

	cancelPayment() {
		this.router.navigate(['/order-confirmation'], {
			queryParams: { orderId: this.orderId },
		});
	}
}

