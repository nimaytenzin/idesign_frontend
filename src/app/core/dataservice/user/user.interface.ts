import { UserRole } from "../../constants/enums";
import { PaginationQueryDto } from "../../constants/paginated.response.interface";
import { EmployeeProfile } from "../hr-management/employee-profile/employee.profile.interface";

export interface User {
	id: number;
	name: string;
	cid: string;
	emailAddress: string;
	phoneNumber?: string;
	role: UserRole;
	isActive: boolean;

	currentAddress?: string;
	permanentAddress?: string;	

	dateOfBirth?: Date | string;
	profileImageUrl?: string;
	resetPasswordToken?: string;
	createdAt?: Date | string;
	updatedAt?: Date | string;

  employeeProfile?: EmployeeProfile;
 }

 

export interface CreateUserDto {
    name: string;
    cid: string;
    emailAddress: string;
    phoneNumber?: string;
    password: string;
    role: UserRole;
    currentAddress?: string;
    permanentAddress?: string;
    dateOfBirth?: Date;
 }

export interface GetUsersQueryDto extends PaginationQueryDto {
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  cid?: string;
  emailAddress?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
  currentAddress?: string;
  permanentAddress?: string;
  dateOfBirth?: Date | string;
  profileImageUrl?: string;
}