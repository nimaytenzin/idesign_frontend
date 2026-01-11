import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModules } from '../../../primeng.modules';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import {
	CalendarEventService,
	CalendarEventResponseDto,
	CreateCalendarEventDto,
	UpdateCalendarEventDto,
} from '../../../core/dataservice';

@Component({
	selector: 'app-admin-calendar',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules, FullCalendarModule],
	providers: [MessageService, ConfirmationService],
	templateUrl: './admin-calendar.component.html',
	styleUrl: './admin-calendar.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class AdminCalendarComponent implements OnInit {
	@ViewChild('fullcalendar') fullcalendar: any;

	calendarOptions: CalendarOptions = {
		initialView: 'dayGridMonth',
		plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin],
		headerToolbar: {
			left: 'prev,next today',
			center: 'title',
			right: 'multiMonthYear,listYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek',
		},
		editable: true,
		selectable: true,
		selectMirror: true,
		dayMaxEvents: true,
		weekends: true,
		select: this.handleDateSelect.bind(this),
		eventClick: this.handleEventClick.bind(this),
		eventDrop: this.handleEventDrop.bind(this),
		eventResize: this.handleEventResize.bind(this),
		events: [],
		height: 'auto',
		contentHeight: 'auto',
		views: {
			multiMonthYear: {
				type: 'multiMonthYear',
				buttonText: 'Year',
				multiMonthMinWidth: 300,
			},
		},
	};

	loading = false;
	showEventDialog = false;
	selectedEvent: EventApi | null = null;
	eventForm: {
		title: string;
		description: string;
		startDate: Date | null;
		endDate: Date | null;
		location: string;
		color: string;
		isAllDay: boolean;
	} = {
		title: '',
		description: '',
		startDate: null,
		endDate: null,
		location: '',
		color: '#3498db',
		isAllDay: false,
	};

	currentEventId: number | null = null;

	constructor(
		private calendarEventService: CalendarEventService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCalendarEvents();
	}

	loadCalendarEvents() {
		this.loading = true;
		const currentYear = new Date().getFullYear();

		this.calendarEventService.getCalendarEventsByYear(currentYear).subscribe({
			next: (events: CalendarEventResponseDto[]) => {
				const calendarEvents: EventInput[] = events.map((event) => ({
					id: event.id.toString(),
					title: event.title,
					start: event.start,
					end: event.end || undefined,
					allDay: event.allDay || false,
					backgroundColor: event.backgroundColor || '#3498db',
					borderColor: event.borderColor || '#3498db',
					textColor: event.textColor || '#ffffff',
					extendedProps: {
						location: event.extendedProps?.location,
						description: event.extendedProps?.description,
						createdBy: event.createdBy,
					},
				}));

				this.calendarOptions.events = calendarEvents;
				this.loading = false;
				this.cdr.detectChanges();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load calendar events',
				});
				this.loading = false;
				this.cdr.detectChanges();
			},
		});
	}

	handleDateSelect(selectInfo: DateSelectArg) {
		this.selectedEvent = null;
		const startDate = selectInfo.start;
		const endDate = selectInfo.end || new Date(startDate.getTime() + 60 * 60 * 1000);

		this.eventForm = {
			title: '',
			description: '',
			startDate: startDate,
			endDate: endDate,
			location: '',
			color: '#3498db',
			isAllDay: selectInfo.allDay,
		};
		this.showEventDialog = true;
		selectInfo.view.calendar.unselect();
	}

	handleEventClick(clickInfo: EventClickArg) {
		this.selectedEvent = clickInfo.event;
		this.currentEventId = typeof clickInfo.event.id === 'string' 
			? parseInt(clickInfo.event.id, 10) 
			: clickInfo.event.id as number;
		
		this.eventForm = {
			title: clickInfo.event.title,
			description: clickInfo.event.extendedProps['description'] || '',
			startDate: clickInfo.event.start ? new Date(clickInfo.event.start) : null,
			endDate: clickInfo.event.end ? new Date(clickInfo.event.end) : null,
			location: clickInfo.event.extendedProps['location'] || '',
			color: clickInfo.event.backgroundColor || '#3498db',
			isAllDay: clickInfo.event.allDay || false,
		};
		this.showEventDialog = true;
	}

	handleEventDrop(dropInfo: any) {
		const eventId = typeof dropInfo.event.id === 'string' 
			? parseInt(dropInfo.event.id, 10) 
			: dropInfo.event.id as number;

		const updateDto: UpdateCalendarEventDto = {
			start: dropInfo.event.start.toISOString(),
			end: dropInfo.event.end ? dropInfo.event.end.toISOString() : undefined,
			allDay: dropInfo.event.allDay,
		};

		this.calendarEventService.updateCalendarEvent(eventId, updateDto).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Event moved successfully',
				});
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to move event',
				});
				// Revert the change by reloading events
				this.loadCalendarEvents();
			},
		});
	}

	handleEventResize(resizeInfo: any) {
		const eventId = typeof resizeInfo.event.id === 'string' 
			? parseInt(resizeInfo.event.id, 10) 
			: resizeInfo.event.id as number;

		const updateDto: UpdateCalendarEventDto = {
			start: resizeInfo.event.start.toISOString(),
			end: resizeInfo.event.end ? resizeInfo.event.end.toISOString() : undefined,
		};

		this.calendarEventService.updateCalendarEvent(eventId, updateDto).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Event resized successfully',
				});
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to resize event',
				});
				// Revert the change by reloading events
				this.loadCalendarEvents();
			},
		});
	}

	saveEvent() {
		if (!this.eventForm.title || !this.eventForm.startDate) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		this.loading = true;

		if (this.currentEventId && this.selectedEvent) {
			// Update existing event
			const updateDto: UpdateCalendarEventDto = {
				title: this.eventForm.title,
				start: this.eventForm.startDate.toISOString(),
				end: this.eventForm.endDate ? this.eventForm.endDate.toISOString() : undefined,
				allDay: this.eventForm.isAllDay,
				backgroundColor: this.eventForm.color,
				borderColor: this.eventForm.color,
				textColor: '#ffffff',
				location: this.eventForm.location || undefined,
				description: this.eventForm.description || undefined,
			};

			this.calendarEventService.updateCalendarEvent(this.currentEventId, updateDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Event updated successfully',
					});
					this.loadCalendarEvents();
					this.closeEventDialog();
				},
				error: (error: any) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update event',
					});
					this.loading = false;
				},
			});
		} else {
			// Create new event
			const createDto: CreateCalendarEventDto = {
				title: this.eventForm.title,
				start: this.eventForm.startDate.toISOString(),
				end: this.eventForm.endDate ? this.eventForm.endDate.toISOString() : undefined,
				allDay: this.eventForm.isAllDay || false,
				backgroundColor: this.eventForm.color,
				borderColor: this.eventForm.color,
				textColor: '#ffffff',
				location: this.eventForm.location || undefined,
				description: this.eventForm.description || undefined,
			};

			this.calendarEventService.createCalendarEvent(createDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Event created successfully',
					});
					this.loadCalendarEvents();
					this.closeEventDialog();
				},
				error: (error: any) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create event',
					});
					this.loading = false;
				},
			});
		}
	}

	deleteEvent() {
		if (!this.currentEventId || !this.selectedEvent) {
			return;
		}

		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${this.selectedEvent.title}"?`,
			header: 'Confirm Deletion',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.calendarEventService.deleteCalendarEvent(this.currentEventId!).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Event deleted successfully',
						});
						this.loadCalendarEvents();
						this.closeEventDialog();
					},
					error: (error: any) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete event',
						});
						this.loading = false;
					},
				});
			},
		});
	}

	openNewEventDialog() {
		this.selectedEvent = null;
		const now = new Date();
		const startDate = new Date(now);
		startDate.setHours(9, 0, 0, 0);
		const endDate = new Date(startDate);
		endDate.setHours(10, 0, 0, 0);

		this.eventForm = {
			title: '',
			description: '',
			startDate: startDate,
			endDate: endDate,
			location: '',
			color: '#3498db',
			isAllDay: false,
		};
		this.showEventDialog = true;
	}

	closeEventDialog() {
		this.showEventDialog = false;
		this.selectedEvent = null;
		this.currentEventId = null;
		this.eventForm = {
			title: '',
			description: '',
			startDate: null,
			endDate: null,
			location: '',
			color: '#3498db',
			isAllDay: false,
		};
	}
}
