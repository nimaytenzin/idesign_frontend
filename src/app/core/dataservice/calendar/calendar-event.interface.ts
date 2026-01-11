/**
 * Calendar Event Management Interfaces
 * Based on the Calendar Event API documentation
 */

import { User } from '../user/user.interface';

/**
 * Calendar Event Entity Interface
 */
export interface CalendarEvent {
	id: number;
	title: string;
	start: Date | string;
	end: Date | string | null;
	allDay: boolean;
	backgroundColor: string | null;
	borderColor: string | null;
	textColor: string | null;
	location: string | null;
	description: string | null;
	createdById: number;
	createdAt: Date | string;
	updatedAt: Date | string;
	createdBy?: User;
}

/**
 * Calendar Event Response DTO
 * Follows FullCalendar Angular EventInput structure
 */
export interface CalendarEventResponseDto {
	id: string | number;
	title: string;
	start: Date | string;
	end?: Date | string | null;
	allDay?: boolean;
	backgroundColor?: string | null;
	borderColor?: string | null;
	textColor?: string | null;
	extendedProps?: {
		location?: string;
		description?: string;
	} | null;
	createdById?: number;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	createdBy?: User;
}

/**
 * Create Calendar Event DTO
 */
export interface CreateCalendarEventDto {
	title: string; // Required
	start: string; // Required (ISO date string)
	end?: string; // Optional (ISO date string)
	allDay?: boolean; // Optional, default: false
	backgroundColor?: string; // Optional
	borderColor?: string; // Optional
	textColor?: string; // Optional
	location?: string; // Optional
	description?: string; // Optional
}

/**
 * Update Calendar Event DTO
 */
export interface UpdateCalendarEventDto {
	title?: string; // Optional
	start?: string; // Optional (ISO date string)
	end?: string; // Optional (ISO date string)
	allDay?: boolean; // Optional
	backgroundColor?: string; // Optional
	borderColor?: string; // Optional
	textColor?: string; // Optional
	location?: string; // Optional
	description?: string; // Optional
}

/**
 * Calendar Event Query DTO
 * For filtering GET /calendar-events
 */
export interface CalendarEventQueryDto {
	start?: string; // Optional (ISO date string)
	end?: string; // Optional (ISO date string)
}
