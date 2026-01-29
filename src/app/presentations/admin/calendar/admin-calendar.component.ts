import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModules } from '../../../primeng.modules';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import {
	CalendarEventService,
	CalendarEventResponseDto,
	UpdateCalendarEventDto,
} from '../../../core/dataservice';
import {
	CalendarEventFormComponent,
	CalendarEventFormData,
} from './calendar-event-form/calendar-event-form.component';
import { CalendarRecurringEventFormComponent } from './calendar-recurring-event-form/calendar-recurring-event-form.component';

@Component({
	selector: 'app-admin-calendar',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules, FullCalendarModule],
	providers: [MessageService, ConfirmationService, DialogService],
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

	constructor(
		private calendarEventService: CalendarEventService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
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
		const startDate = selectInfo.start;
		const endDate = selectInfo.end || new Date(startDate.getTime() + 60 * 60 * 1000);
		const initialForm: CalendarEventFormData = {
			title: '',
			description: '',
			startDate,
			endDate,
			location: '',
			color: '#3498db',
			isAllDay: selectInfo.allDay,
		};
		selectInfo.view.calendar.unselect();

		const ref = this.dialogService.open(CalendarEventFormComponent, {
			header: 'Create Event',
			width: '600px',
			modal: true,
			dismissableMask: true,
			styleClass: 'p-dialog-maximized-responsive',
			data: { mode: 'create', initialForm },
		});
		ref.onClose.subscribe((result) => {
			if (result) this.loadCalendarEvents();
		});
	}

	handleEventClick(clickInfo: EventClickArg) {
		const eventId = typeof clickInfo.event.id === 'string'
			? parseInt(clickInfo.event.id, 10)
			: (clickInfo.event.id as number);
		const initialForm: CalendarEventFormData = {
			title: clickInfo.event.title,
			description: (clickInfo.event.extendedProps as { description?: string })?.description ?? '',
			startDate: clickInfo.event.start ? new Date(clickInfo.event.start) : null,
			endDate: clickInfo.event.end ? new Date(clickInfo.event.end) : null,
			location: (clickInfo.event.extendedProps as { location?: string })?.location ?? '',
			color: clickInfo.event.backgroundColor ?? '#3498db',
			isAllDay: clickInfo.event.allDay ?? false,
		};

		const ref = this.dialogService.open(CalendarEventFormComponent, {
			header: 'Edit Event',
			width: '600px',
			modal: true,
			dismissableMask: true,
			styleClass: 'p-dialog-maximized-responsive',
			data: { mode: 'edit', eventId, initialForm },
		});
		ref.onClose.subscribe((result) => {
			if (result) this.loadCalendarEvents();
		});
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

	openNewEventDialog() {
		const now = new Date();
		const startDate = new Date(now);
		startDate.setHours(9, 0, 0, 0);
		const endDate = new Date(startDate);
		endDate.setHours(10, 0, 0, 0);
		const initialForm: CalendarEventFormData = {
			title: '',
			description: '',
			startDate,
			endDate,
			location: '',
			color: '#3498db',
			isAllDay: false,
		};

		const ref = this.dialogService.open(CalendarEventFormComponent, {
			header: 'Create Event',
			width: '600px',
			modal: true,
			dismissableMask: true,
			styleClass: 'p-dialog-maximized-responsive',
			data: { mode: 'create', initialForm },
		});
		ref.onClose.subscribe((result) => {
			if (result) this.loadCalendarEvents();
		});
	}

	openRecurringEventDialog() {
		const ref = this.dialogService.open(CalendarRecurringEventFormComponent, {
			header: 'Create Recurring Events',
			width: '600px',
			modal: true,
			dismissableMask: true,
			styleClass: 'p-dialog-maximized-responsive',
		});
		ref.onClose.subscribe((result) => {
			if (result) this.loadCalendarEvents();
		});
	}
}
