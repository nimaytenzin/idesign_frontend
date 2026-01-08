import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Event,
	EventType,
	EventCategory,
	CreateEventDto,
	UpdateEventDto,
	CreateEventTypeDto,
	UpdateEventTypeDto,
	CreateEventCategoryDto,
	UpdateEventCategoryDto,
	EventQueryDto,
} from './calendar.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class CalendarService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/events`;

	constructor(private http: HttpClient) {}

	// ========== Event Methods ==========

	/**
	 * Create a new event
	 */
	createEvent(eventData: CreateEventDto): Observable<Event> {
		return this.http.post<Event>(this.apiUrl, eventData);
	}

	/**
	 * Get all events with optional filtering
	 */
	getEvents(query?: EventQueryDto): Observable<Event[]> {
		let params = new HttpParams();
		if (query) {
			if (query.view) params = params.set('view', query.view);
			if (query.startDate) params = params.set('startDate', query.startDate);
			if (query.endDate) params = params.set('endDate', query.endDate);
			if (query.eventTypeId)
				params = params.set('eventTypeId', query.eventTypeId.toString());
			if (query.eventCategoryId)
				params = params.set(
					'eventCategoryId',
					query.eventCategoryId.toString()
				);
		}
		return this.http.get<Event[]>(this.apiUrl, { params });
	}

	/**
	 * Get event by ID
	 */
	getEventById(id: number): Observable<Event> {
		return this.http.get<Event>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update an event
	 */
	updateEvent(id: number, eventData: UpdateEventDto): Observable<Event> {
		return this.http.patch<Event>(`${this.apiUrl}/${id}`, eventData);
	}

	/**
	 * Delete an event
	 */
	deleteEvent(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	// ========== Calendar View Methods ==========

	/**
	 * Get events for a specific day
	 * @param date - Date in format YYYY-MM-DD
	 */
	getDayView(date: string): Observable<Event[]> {
		return this.http.get<Event[]>(`${this.apiUrl}/calendar/day/${date}`);
	}

	/**
	 * Get events for a week starting from the specified date
	 * @param startDate - Start date in format YYYY-MM-DD
	 */
	getWeekView(startDate: string): Observable<Event[]> {
		return this.http.get<Event[]>(`${this.apiUrl}/calendar/week/${startDate}`);
	}

	/**
	 * Get events for a specific month
	 * @param year - Year (e.g., 2024)
	 * @param month - Month (1-12)
	 */
	getMonthView(year: number, month: number): Observable<Event[]> {
		return this.http.get<Event[]>(
			`${this.apiUrl}/calendar/month/${year}/${month}`
		);
	}

	// ========== Event Type Methods ==========

	/**
	 * Create a new event type
	 */
	createEventType(eventTypeData: CreateEventTypeDto): Observable<EventType> {
		return this.http.post<EventType>(
			`${this.apiUrl}/event-types`,
			eventTypeData
		);
	}

	/**
	 * Get all event types
	 */
	getEventTypes(): Observable<EventType[]> {
		return this.http.get<EventType[]>(`${this.apiUrl}/event-types`);
	}

	/**
	 * Update an event type
	 */
	updateEventType(
		id: number,
		eventTypeData: UpdateEventTypeDto
	): Observable<EventType> {
		return this.http.patch<EventType>(
			`${this.apiUrl}/event-types/${id}`,
			eventTypeData
		);
	}

	/**
	 * Delete an event type
	 */
	deleteEventType(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/event-types/${id}`);
	}

	// ========== Event Category Methods ==========

	/**
	 * Create a new event category
	 */
	createEventCategory(
		categoryData: CreateEventCategoryDto
	): Observable<EventCategory> {
		return this.http.post<EventCategory>(
			`${this.apiUrl}/event-categories`,
			categoryData
		);
	}

	/**
	 * Get all event categories
	 */
	getEventCategories(): Observable<EventCategory[]> {
		return this.http.get<EventCategory[]>(`${this.apiUrl}/event-categories`);
	}

	/**
	 * Update an event category
	 */
	updateEventCategory(
		id: number,
		categoryData: UpdateEventCategoryDto
	): Observable<EventCategory> {
		return this.http.patch<EventCategory>(
			`${this.apiUrl}/event-categories/${id}`,
			categoryData
		);
	}

	/**
	 * Delete an event category
	 */
	deleteEventCategory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/event-categories/${id}`);
	}
}

