import { BankAccount } from '../bank-account/bank-account.interface';
import { PaymentMethod } from '../../constants/enums';

// Entity
export interface PaymentReceipt {
	id: number;
	orderId: number;
	bankAccountId: number | null;
	receiptNumber: string;
	amount: number;
	paymentMethod: PaymentMethod;
	paidAt: string; // ISO date
	notes?: string | null;
	bankAccount?: BankAccount;
}

// DTOs

/** For POST /payment-receipts. bankAccountId required when paymentMethod is not CASH. */
export interface CreatePaymentReceiptDto {
	orderId: number;
	amount: number;
	paymentMethod: PaymentMethod;
	bankAccountId?: number | null; // Required when paymentMethod is MBOB, BDB_EPAY, TPAY, BNB_MPAY, ZPSS
	paidAt?: string; // ISO date
	notes?: string;
}

/** For POST /orders/:id/payments. bankAccountId required when paymentMethod is not CASH. */
export interface RecordOrderPaymentDto {
	amount: number;
	paymentMethod: PaymentMethod;
	bankAccountId?: number | null; // Required when paymentMethod is MBOB, BDB_EPAY, TPAY, BNB_MPAY, ZPSS
	paidAt?: string; // ISO date
	transactionId?: string;
	notes?: string;
}
