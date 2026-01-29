export enum ZpssBankName {
	BOB = 'BOB',
	BNB = 'BNB',
	PNB = 'PNB',
	BDBL = 'BDBL',
	TBANK = 'TBANK',
	DKBANK = 'DKBANK',
}

export interface Company {
	id?: number;
	name: string;
	phone1?: string;
	phone2?: string;
	phone3?: string;
	email?: string;
	address?: string;
	dzongkhag?: string;
	thromde?: string;
	country?: string;
	lat: number;
	long: number;
	website?: string;
	tpnNumber?: string;
	businessLicenseNumber?: string;
	slogan?: string;
	facebookLink?: string;
	instagramLink?: string;
	tiktokLink?: string;
	description?: string;
	logo?: string;
	isActive?: boolean;
	zpssBankName?: ZpssBankName;
	zpssAccountName?: string;
	zpssAccountNumber?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateCompanyDto {
	name: string;
	phone1?: string;
	phone2?: string;
	phone3?: string;
	email?: string;
	address?: string;
	dzongkhag?: string;
	thromde?: string;
	country?: string;
	lat: number;
	long: number;
	website?: string;
	tpnNumber?: string;
	businessLicenseNumber?: string;
	slogan?: string;
	facebookLink?: string;
	instagramLink?: string;
	tiktokLink?: string;
	description?: string;
	logo?: string;
	isActive?: boolean;
	zpssBankName?: ZpssBankName;
	zpssAccountName?: string;
	zpssAccountNumber?: string;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {}

