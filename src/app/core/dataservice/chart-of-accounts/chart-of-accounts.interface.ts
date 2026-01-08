/**
 * Account Type Enum
 */
export enum AccountType {
	ASSET = 'ASSET',
	LIABILITY = 'LIABILITY',
	EQUITY = 'EQUITY',
	REVENUE = 'REVENUE',
	EXPENSE = 'EXPENSE',
}

/**
 * Normal Balance Enum
 */
export enum NormalBalance {
	DEBIT = 'DEBIT',
	CREDIT = 'CREDIT',
}

/**
 * Chart of Accounts Entity
 */
export interface ChartOfAccounts {
	accountCode: string;
	accountName: string;
	accountType: AccountType;
	normalBalance: NormalBalance;
	description?: string;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Create Chart of Accounts DTO
 */
export interface CreateChartOfAccountsDto {
	accountCode: string;
	accountName: string;
	accountType: AccountType;
	normalBalance: NormalBalance;
	description?: string;
	isActive?: boolean;
}

/**
 * Update Chart of Accounts DTO
 */
export interface UpdateChartOfAccountsDto
	extends Partial<CreateChartOfAccountsDto> {}

/**
 * Account Type Display Info
 */
export interface AccountTypeInfo {
	value: AccountType;
	label: string;
	description: string;
	color: string;
}

/**
 * Account Type Helper
 */
export class AccountTypeHelper {
	static readonly TYPES: AccountTypeInfo[] = [
		{
			value: AccountType.ASSET,
			label: 'Asset',
			description: 'Resources owned by the company',
			color: '#4CAF50',
		},
		{
			value: AccountType.LIABILITY,
			label: 'Liability',
			description: 'Obligations owed by the company',
			color: '#F44336',
		},
		{
			value: AccountType.EQUITY,
			label: 'Equity',
			description: "Owner's interest in the company",
			color: '#2196F3',
		},
		{
			value: AccountType.REVENUE,
			label: 'Revenue',
			description: 'Income generated from operations',
			color: '#9C27B0',
		},
		{
			value: AccountType.EXPENSE,
			label: 'Expense',
			description: 'Costs incurred in operations',
			color: '#FF9800',
		},
	];

	static getTypeInfo(type: AccountType): AccountTypeInfo {
		return (
			this.TYPES.find((t) => t.value === type) || this.TYPES[0]
		);
	}

	static getLabel(type: AccountType): string {
		return this.getTypeInfo(type).label;
	}

	static getDefaultNormalBalance(type: AccountType): NormalBalance {
		// Assets and Expenses have debit normal balance
		if (type === AccountType.ASSET || type === AccountType.EXPENSE) {
			return NormalBalance.DEBIT;
		}
		// Liabilities, Equity, and Revenue have credit normal balance
		return NormalBalance.CREDIT;
	}
}

