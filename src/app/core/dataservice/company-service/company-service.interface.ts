export interface CompanyService {
	id: number;
	title: string;
	description?: string;
	imageUri?: string;
	icon?: string; // Prime icon class name (e.g., "pi pi-check", "pi pi-star")
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateCompanyServiceDto {
	title: string;
	description?: string;
	imageUri?: string; // Optional - will be set from file upload
	icon?: string; // Prime icon class name
	isActive?: boolean;
}

export interface UpdateCompanyServiceDto {
	title?: string;
	description?: string;
	imageUri?: string; // Optional - will be set from file upload if new image is uploaded
	icon?: string; // Prime icon class name
	isActive?: boolean;
}

