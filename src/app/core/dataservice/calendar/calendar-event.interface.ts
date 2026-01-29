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

/**
 * Recurrence type for recurring calendar events
 * WEEKLY = same day of week every week
 * MONTHLY = same day of month every month
 * ANNUALLY = same date every year
 */
export type RecurrenceType = 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';

/**
 * Create Recurring Calendar Event DTO
 * POST /calendar-events/recurring
 * Generates one event per occurrence between startFrom and endAt
 */
export interface CreateRecurringCalendarEventDto {
	title: string;
	recurrenceType: RecurrenceType;
	/** Time of day: HH:mm or HH:mm:ss (e.g. "17:00" for 5pm) */
	time: string;
	/** First date for occurrences: YYYY-MM-DD */
	startFrom: string;
	/** Last date for occurrences: YYYY-MM-DD */
	endAt: string;
	/** 1 = Monday, 7 = Sunday. Required when recurrenceType is WEEKLY */
	dayOfWeek?: number;
	/** Day of month 1–31. Required when recurrenceType is MONTHLY or ANNUALLY */
	dayOfMonth?: number;
	/** Month 1–12. Required when recurrenceType is ANNUALLY */
	month?: number;
	/** Duration in minutes. Default 60. Max 1440 */
	durationMinutes?: number;
	allDay?: boolean;
	backgroundColor?: string;
	borderColor?: string;
	textColor?: string;
	location?: string;
	description?: string;
}
