import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PrimeNgModules } from '../../../primeng.modules';
import { CalendarService } from '../../../core/dataservice/calendar/calendar.service';
import {
	Event,
	EventType,
	EventCategory,
	CreateEventDto,
	UpdateEventDto,
} from '../../../core/dataservice/calendar/calendar.interface';
import { MessageService } from 'primeng/api';

type CalendarView = 'day' | 'week' | 'month';

@Component({
	selector: 'app-admin-calendar',
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-calendar.component.html',
	styleUrl: './admin-calendar.component.scss',
})
export class AdminCalendarComponent implements OnInit {
	currentView: CalendarView = 'month';
	currentDate: Date = new Date();
	selectedDate: Date = new Date();
	
	events: Event[] = [];
	eventTypes: EventType[] = [];
	eventCategories: EventCategory[] = [];
	
	loading = false;
	showEventDialog = false;
	showEventTypeDialog = false;
	showEventCategoryDialog = false;
	
	selectedEvent: Event | null = null;
	eventForm: {
		title: string;
		description: string;
		startDate: Date | string;
		endDate: Date | string;
		location: string;
		eventTypeId: number;
		eventCategoryId?: number;
		isAllDay: boolean;
	} = {
		title: '',
		description: '',
		startDate: new Date(),
		endDate: new Date(),
		location: '',
		eventTypeId: 0,
		eventCategoryId: undefined,
		isAllDay: false,
	};
	
	eventTypeForm: { name: string; description: string; color: string } = {
		name: '',
		description: '',
		color: '#3498db',
	};
	
	eventCategoryForm: { name: string; description: string; color: string } = {
		name: '',
		description: '',
		color: '#2ecc71',
	};

	constructor(
		private calendarService: CalendarService,
		private messageService: MessageService
	) {}

	ngOnInit() {
		this.loadEventTypes();
		this.loadEventCategories();
		this.loadEvents();
	}

	loadEvents() {
		this.loading = true;
		const year = this.currentDate.getFullYear();
		const month = this.currentDate.getMonth() + 1;
		const date = this.currentDate.toISOString().split('T')[0];

		let request: Observable<Event[]>;
		switch (this.currentView) {
			case 'day':
				request = this.calendarService.getDayView(date);
				break;
			case 'week':
				request = this.calendarService.getWeekView(date);
				break;
			case 'month':
				request = this.calendarService.getMonthView(year, month);
				break;
			default:
				request = this.calendarService.getEvents();
		}

		request.subscribe({
			next: (events) => {
				this.events = events;
				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading events:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load events',
				});
				this.loading = false;
			},
		});
	}

	loadEventTypes() {
		this.calendarService.getEventTypes().subscribe({
			next: (types) => {
				this.eventTypes = types;
			},
			error: (error) => {
				console.error('Error loading event types:', error);
			},
		});
	}

	loadEventCategories() {
		this.calendarService.getEventCategories().subscribe({
			next: (categories) => {
				this.eventCategories = categories;
			},
			error: (error) => {
				console.error('Error loading event categories:', error);
			},
		});
	}

	onViewChange(view: CalendarView) {
		this.currentView = view;
		this.loadEvents();
	}

	onDateChange(date: Date) {
		this.currentDate = date;
		this.loadEvents();
	}

	onDateSelect(event: any) {
		this.selectedDate = event;
		this.openNewEventDialog();
	}

	navigatePrevious() {
		const newDate = new Date(this.currentDate);
		if (this.currentView === 'month') {
			newDate.setMonth(newDate.getMonth() - 1);
		} else if (this.currentView === 'week') {
			newDate.setDate(newDate.getDate() - 7);
		} else {
			newDate.setDate(newDate.getDate() - 1);
		}
		this.onDateChange(newDate);
	}

	navigateNext() {
		const newDate = new Date(this.currentDate);
		if (this.currentView === 'month') {
			newDate.setMonth(newDate.getMonth() + 1);
		} else if (this.currentView === 'week') {
			newDate.setDate(newDate.getDate() + 7);
		} else {
			newDate.setDate(newDate.getDate() + 1);
		}
		this.onDateChange(newDate);
	}

	navigateToday() {
		this.onDateChange(new Date());
	}

	openNewEventDialog() {
		this.selectedEvent = null;
		const startDate = new Date(this.selectedDate);
		startDate.setHours(9, 0, 0, 0); // Default to 9 AM
		const endDate = new Date(startDate);
		endDate.setHours(10, 0, 0, 0); // Default to 10 AM
		
		this.eventForm = {
			title: '',
			description: '',
			startDate: startDate,
			endDate: endDate,
			location: '',
			eventTypeId: this.eventTypes.length > 0 ? this.eventTypes[0].id : 0,
			eventCategoryId: undefined,
			isAllDay: false,
		};
		this.showEventDialog = true;
	}

	openEditEventDialog(event: Event) {
		this.selectedEvent = event;
		this.eventForm = {
			title: event.title,
			description: event.description || '',
			startDate: new Date(event.startDate),
			endDate: new Date(event.endDate),
			location: event.location || '',
			eventTypeId: event.eventTypeId,
			eventCategoryId: event.eventCategoryId || undefined,
			isAllDay: event.isAllDay,
		};
		this.showEventDialog = true;
	}

	saveEvent() {
		if (!this.eventForm.title || !this.eventForm.startDate || !this.eventForm.endDate) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		// Convert Date objects to ISO strings
		const eventData: CreateEventDto | UpdateEventDto = {
			title: this.eventForm.title,
			description: this.eventForm.description,
			startDate: this.eventForm.startDate instanceof Date 
				? this.eventForm.startDate.toISOString() 
				: this.eventForm.startDate,
			endDate: this.eventForm.endDate instanceof Date 
				? this.eventForm.endDate.toISOString() 
				: this.eventForm.endDate,
			location: this.eventForm.location,
			eventTypeId: this.eventForm.eventTypeId,
			eventCategoryId: this.eventForm.eventCategoryId,
			isAllDay: this.eventForm.isAllDay,
		};

		if (this.selectedEvent) {
			// Update existing event
			this.calendarService
				.updateEvent(this.selectedEvent.id, eventData as UpdateEventDto)
				.subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Event updated successfully',
						});
						this.showEventDialog = false;
						this.loadEvents();
					},
					error: (error) => {
						console.error('Error updating event:', error);
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to update event',
						});
					},
				});
		} else {
			// Create new event
			this.calendarService
				.createEvent(eventData as CreateEventDto)
				.subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Event created successfully',
						});
						this.showEventDialog = false;
						this.loadEvents();
					},
					error: (error) => {
						console.error('Error creating event:', error);
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to create event',
						});
					},
				});
		}
	}

	deleteEvent(event: Event) {
		if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
			this.calendarService.deleteEvent(event.id).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Event deleted successfully',
					});
					this.loadEvents();
				},
				error: (error) => {
					console.error('Error deleting event:', error);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete event',
					});
				},
			});
		}
	}

	openEventTypeDialog() {
		this.eventTypeForm = { name: '', description: '', color: '#3498db' };
		this.showEventTypeDialog = true;
	}

	saveEventType() {
		if (!this.eventTypeForm.name) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Event type name is required',
			});
			return;
		}

		this.calendarService.createEventType(this.eventTypeForm).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Event type created successfully',
				});
				this.showEventTypeDialog = false;
				this.loadEventTypes();
			},
			error: (error) => {
				console.error('Error creating event type:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to create event type',
				});
			},
		});
	}

	openEventCategoryDialog() {
		this.eventCategoryForm = { name: '', description: '', color: '#2ecc71' };
		this.showEventCategoryDialog = true;
	}

	saveEventCategory() {
		if (!this.eventCategoryForm.name) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Event category name is required',
			});
			return;
		}

		this.calendarService.createEventCategory(this.eventCategoryForm).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Event category created successfully',
				});
				this.showEventCategoryDialog = false;
				this.loadEventCategories();
			},
			error: (error) => {
				console.error('Error creating event category:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to create event category',
				});
			},
		});
	}

	getEventTypeColor(eventTypeId: number): string {
		const type = this.eventTypes.find((t) => t.id === eventTypeId);
		return type?.color || '#3498db';
	}

	getEventCategoryColor(categoryId: number | null): string {
		if (!categoryId) return '#95a5a6';
		const category = this.eventCategories.find((c) => c.id === categoryId);
		return category?.color || '#95a5a6';
	}

	formatDateTime(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}:00`;
	}

	parseDateTime(dateString: string): Date {
		return new Date(dateString);
	}

	formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

	formatTime(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	getEventsForDate(date: Date): Event[] {
		const dateStr = date.toISOString().split('T')[0];
		const dateStart = new Date(dateStr + 'T00:00:00');
		const dateEnd = new Date(dateStr + 'T23:59:59');
		
		return this.events.filter((event) => {
			const eventStart = new Date(event.startDate);
			const eventEnd = new Date(event.endDate);
			
			// Event starts on this date, ends on this date, or spans across this date
			return (
				(eventStart >= dateStart && eventStart <= dateEnd) ||
				(eventEnd >= dateStart && eventEnd <= dateEnd) ||
				(eventStart <= dateStart && eventEnd >= dateEnd)
			);
		});
	}

	getMonthDays(): Date[] {
		const year = this.currentDate.getFullYear();
		const month = this.currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - startDate.getDay());
		
		const days: Date[] = [];
		const currentDate = new Date(startDate);
		
		for (let i = 0; i < 42; i++) {
			days.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		
		return days;
	}

	getWeekDays(): Date[] {
		const startDate = new Date(this.currentDate);
		startDate.setDate(startDate.getDate() - startDate.getDay());
		
		const days: Date[] = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(startDate);
			day.setDate(startDate.getDate() + i);
			days.push(day);
		}
		
		return days;
	}

	getHours(): number[] {
		return Array.from({ length: 24 }, (_, i) => i);
	}

	formatHour(hour: number): string {
		return `${hour.toString().padStart(2, '0')}:00`;
	}

	isToday(date: Date): boolean {
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	}

	getDayName(date: Date): string {
		return date.toLocaleDateString('en-US', { weekday: 'short' });
	}

	hasEventAtHour(date: Date, hour: number): boolean {
		return this.getEventsForDate(date).some((event) => {
			const eventDate = new Date(event.startDate);
			return eventDate.getHours() === hour;
		});
	}

	getEventTop(event: Event): number {
		const eventDate = new Date(event.startDate);
		const hours = eventDate.getHours();
		const minutes = eventDate.getMinutes();
		return (hours * 60 + minutes) / 24 / 60 * 100;
	}

	getEventHeight(event: Event): number {
		const start = new Date(event.startDate);
		const end = new Date(event.endDate);
		const duration = (end.getTime() - start.getTime()) / (1000 * 60); // duration in minutes
		return (duration / 24 / 60) * 100;
	}
}

