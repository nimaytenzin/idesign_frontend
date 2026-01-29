// Entity
export interface BankAccount {
	id: number;
	accountName: string;
	bankName: string;
	accountNumber: string;
	isActive: boolean;
	useForRmaPg: boolean;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}

// DTOs
export interface CreateBankAccountDto {
	accountName: string;
	bankName: string;
	accountNumber: string;
	isActive?: boolean;
	useForRmaPg?: boolean;
}

export interface UpdateBankAccountDto {
	accountName?: string;
	bankName?: string;
	accountNumber?: string;
	isActive?: boolean;
	useForRmaPg?: boolean;
}
