import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	CalendarEvent,
	CalendarEventResponseDto,
	CreateCalendarEventDto,
	CreateRecurringCalendarEventDto,
	UpdateCalendarEventDto,
	CalendarEventQueryDto,
} from './calendar-event.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class CalendarEventService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/calendar-events`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new calendar event
	 * POST /calendar-events
	 * @param dto Calendar event data
	 * @returns Observable of CalendarEventResponseDto
	 */
	createCalendarEvent(
		dto: CreateCalendarEventDto
	): Observable<CalendarEventResponseDto> {
		return this.http.post<CalendarEventResponseDto>(this.apiUrl, dto);
	}

	/**
	 * Create recurring calendar events (one event per occurrence in date range)
	 * POST /calendar-events/recurring
	 * @param dto Recurring event data (WEEKLY, MONTHLY, or ANNUALLY)
	 * @returns Observable of CalendarEventResponseDto array
	 */
	createRecurringCalendarEvents(
		dto: CreateRecurringCalendarEventDto
	): Observable<CalendarEventResponseDto[]> {
		return this.http.post<CalendarEventResponseDto[]>(
			`${this.apiUrl}/recurring`,
			dto
		);
	}

	/**
	 * Get all calendar events with optional date range filter
	 * GET /calendar-events
	 * @param query Optional query parameters for filtering by date range
	 * @returns Observable of CalendarEventResponseDto array
	 */
	getAllCalendarEvents(
		query?: CalendarEventQueryDto
	): Observable<CalendarEventResponseDto[]> {
		let params = new HttpParams();

		if (query) {
			if (query.start) {
				params = params.set('start', query.start);
			}
			if (query.end) {
				params = params.set('end', query.end);
			}
		}

		return this.http.get<CalendarEventResponseDto[]>(this.apiUrl, {
			params,
		});
	}

	/**
	 * Get all events that overlap the current month (server UTC).
	 * GET /calendar-events/this-month
	 * No query parameters. Ordered by start ascending.
	 * @returns Observable of CalendarEventResponseDto array
	 */
	getEventsThisMonth(): Observable<CalendarEventResponseDto[]> {
		return this.http.get<CalendarEventResponseDto[]>(
			`${this.apiUrl}/this-month`
		);
	}

	/**
	 * Get all calendar events for a specific year
	 * GET /calendar-events/calendar/:year
	 * @param year Year (e.g., 2026)
	 * @returns Observable of CalendarEventResponseDto array
	 */
	getCalendarEventsByYear(
		year: number
	): Observable<CalendarEventResponseDto[]> {
		return this.http.get<CalendarEventResponseDto[]>(
			`${this.apiUrl}/calendar/${year}`
		);
	}

	/**
	 * Get a single calendar event by ID
	 * GET /calendar-events/:id
	 * @param id Event ID
	 * @returns Observable of CalendarEventResponseDto
	 */
	getCalendarEventById(id: number): Observable<CalendarEventResponseDto> {
		return this.http.get<CalendarEventResponseDto>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update a calendar event
	 * PATCH /calendar-events/:id
	 * @param id Event ID
	 * @param dto Updated calendar event data
	 * @returns Observable of CalendarEventResponseDto
	 */
	updateCalendarEvent(
		id: number,
		dto: UpdateCalendarEventDto
	): Observable<CalendarEventResponseDto> {
		return this.http.patch<CalendarEventResponseDto>(
			`${this.apiUrl}/${id}`,
			dto
		);
	}

	/**
	 * Delete a calendar event
	 * DELETE /calendar-events/:id
	 * @param id Event ID
	 * @returns Observable of void
	 */
	deleteCalendarEvent(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}
