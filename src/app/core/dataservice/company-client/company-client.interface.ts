export interface CompanyClient {
	id: number;
	name: string;
	websiteUrl?: string;
	socialMediaUrl?: string;
	logo?: string;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateCompanyClientDto {
	name: string;
	websiteUrl?: string;
	socialMediaUrl?: string;
	logo?: string; // Optional - will be set from file upload
	isActive?: boolean;
}

export interface UpdateCompanyClientDto {
	name?: string;
	websiteUrl?: string;
	socialMediaUrl?: string;
	logo?: string; // Optional - will be set from file upload if new logo is uploaded
	isActive?: boolean;
}

