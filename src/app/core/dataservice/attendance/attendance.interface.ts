/**
 * Attendance Management Interfaces
 * Based on the Attendance Module API documentation
 */

/**
 * Attendance Response DTO
 * Returned when marking attendance successfully
 */
export interface AttendanceResponseDto {
	id: number;
	userId: number;
	date: Date | string;
	attendanceTime: Date | string;
	userLat: number;
	userLong: number;
	distanceFromOffice: number;
	createdAt: Date | string;
	updatedAt: Date | string;
	user?: {
		id: number;
		name: string;
		emailAddress: string;
		role: string;
	};
}

/**
 * Attendance Details (nested in StaffAttendanceResponseDto)
 */
export interface AttendanceDetails {
	id: number;
	date: Date | string;
	attendanceTime: Date | string;
	distanceFromOffice: number;
}

/**
 * Staff Attendance Response DTO
 * Response for the daily attendance viewer
 * Contains staff user info and their attendance status
 */
export interface StaffAttendanceResponseDto {
	userId: number;
	userName: string;
	userEmail: string;
	userPhoneNumber?: string;
	attendance?: AttendanceDetails;
}

/**
 * Create Attendance DTO
 * Used for marking attendance with user's device location coordinates
 */
export interface CreateAttendanceDto {
	lat: number;   // Latitude (required, must be a number)
	long: number;  // Longitude (required, must be a number)
}
