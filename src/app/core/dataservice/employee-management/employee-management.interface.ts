export enum EmployeeStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	TERMINATED = 'TERMINATED',
}

export enum UserRole {
	ADMIN = 'ADMIN',
	STAFF = 'STAFF',
}

export interface StaffMember {
	id: number;
	name: string;
	cid: string;
	emailAddress: string;
	phoneNumber?: string;
	role: UserRole;
	department?: string;
	position?: string;
	address?: string;
	dateOfBirth?: string | Date;
	hireDate?: string | Date;
	employeeStatus: EmployeeStatus;
	employeeId?: string;
	terminationDate?: string | Date;
	profileImageUrl?: string;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface CreateStaffMemberDto {
	name: string;
	cid: string;
	emailAddress: string;
	password: string;
	phoneNumber?: string;
	department?: string;
	position?: string;
	address?: string;
	dateOfBirth?: string;
	hireDate?: string;
	profileImageUrl?: string;
}

export interface UpdateStaffMemberDto {
	name?: string;
	cid?: string;
	emailAddress?: string;
	phoneNumber?: string;
	department?: string;
	position?: string;
	address?: string;
	dateOfBirth?: string;
	hireDate?: string;
	employeeStatus?: EmployeeStatus;
	terminationDate?: string;
	profileImageUrl?: string;
}

export interface ResetPasswordDto {
	newPassword: string;
}

export interface ResetPasswordResponse {
	message: string;
}

// Education Interfaces
export interface EmployeeEducation {
	id: number;
	userId: number;
	level: string;
	courseTitle: string;
	institute: string;
	startDate: string | Date;
	endDate: string | Date;
	durationDays: number;
	funding?: string;
	status: string;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface CreateEducationDto {
	level: string;
	courseTitle: string;
	institute: string;
	startDate: string;
	endDate: string;
	durationDays?: number;
	funding?: string;
	status: string;
}

export interface UpdateEducationDto {
	level?: string;
	courseTitle?: string;
	institute?: string;
	startDate?: string;
	endDate?: string;
	durationDays?: number;
	funding?: string;
	status?: string;
}

// Work Experience Interfaces
export interface EmployeeWorkExperience {
	id: number;
	userId: number;
	positionTitle: string;
	effectiveDate: string | Date;
	agency: string;
	place: string;
	endDate?: string | Date | null;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface CreateWorkExperienceDto {
	positionTitle: string;
	effectiveDate: string;
	agency: string;
	place: string;
	endDate?: string | null;
}

export interface UpdateWorkExperienceDto {
	positionTitle?: string;
	effectiveDate?: string;
	agency?: string;
	place?: string;
	endDate?: string | null;
}

// Delete Response Interface
export interface DeleteResponse {
	message: string;
}
