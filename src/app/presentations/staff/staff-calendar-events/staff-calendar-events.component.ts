import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModules } from '../../../primeng.modules';
import { MessageService } from 'primeng/api';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CalendarEventService, CalendarEventResponseDto } from '../../../core/dataservice';

@Component({
	selector: 'app-staff-calendar-events',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules, FullCalendarModule],
	providers: [MessageService],
	templateUrl: './staff-calendar-events.component.html',
	styleUrl: './staff-calendar-events.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class StaffCalendarEventsComponent implements OnInit {
	@ViewChild('fullcalendar') fullcalendar: any;

	calendarOptions: CalendarOptions = {
		initialView: 'dayGridMonth',
		plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
		headerToolbar: {
			left: 'title',
			center: '',
			right: 'prev,next today',
		},
		editable: false,
		selectable: false,
		dayMaxEvents: true,
		weekends: true,
		eventClick: this.handleEventClick.bind(this),
		events: [],
		height: 'auto',
		contentHeight: 'auto',
	};

	loading = false;
	showEventDialog = false;
	selectedEvent: EventApi | null = null;
	eventDetails: CalendarEventResponseDto | null = null;

	constructor(
		private calendarEventService: CalendarEventService,
		private messageService: MessageService,
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
					backgroundColor: event.backgroundColor || '#6b7280',
					borderColor: event.borderColor || '#6b7280',
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

	handleEventClick(clickInfo: EventClickArg) {
		this.selectedEvent = clickInfo.event;
		// Find the full event details from the API response
		this.loadEventDetails(clickInfo.event.id);
	}

	loadEventDetails(eventId: string | number) {
		const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
		this.calendarEventService.getCalendarEventById(id).subscribe({
			next: (event: CalendarEventResponseDto) => {
				this.eventDetails = event;
				this.showEventDialog = true;
				this.cdr.detectChanges();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load event details',
				});
			},
		});
	}

	closeEventDialog() {
		this.showEventDialog = false;
		this.selectedEvent = null;
		this.eventDetails = null;
	}

	formatDate(date: Date | string | null | undefined): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString();
	}
}
