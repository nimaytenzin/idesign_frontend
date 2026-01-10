// Auth-related interfaces and types

import { UserRole } from "../../constants/enums";
import { User } from "../user/user.interface";

export interface LoginDto {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: User;
}


export interface UserJwtPayload {
	sub: number;
	cid: string;
	email: string;
	role: UserRole;
}

export interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
}

export interface ApiError {
	statusCode: number;
	message: string;
	error?: string;
}

export interface ChangePasswordDto {
	currentPassword: string;
	newPassword: string;
}

export interface ResetPasswordDto {
	token: string;
	newPassword: string;
}

export interface ChangePasswordResponse {
	message: string;
}

export interface ResetPasswordResponse {
	message: string;
}

export interface SignOutResponse {
	message: string;
}
 


  
  export interface AdminResetPasswordDto {
	userId: number;
	newPassword: string;
  }