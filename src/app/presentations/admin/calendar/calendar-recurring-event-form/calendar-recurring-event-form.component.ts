import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PrimeNgModules } from '../../../../primeng.modules';
import {
	CalendarEventService,
	CreateRecurringCalendarEventDto,
	RecurrenceType,
} from '../../../../core/dataservice';

@Component({
	selector: 'app-calendar-recurring-event-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './calendar-recurring-event-form.component.html',
	styleUrl: './calendar-recurring-event-form.component.scss',
})
export class CalendarRecurringEventFormComponent {
	recurrenceTypes: { label: string; value: RecurrenceType }[] = [
		{ label: 'Weekly (same day every week)', value: 'WEEKLY' },
		{ label: 'Monthly (same day every month)', value: 'MONTHLY' },
		{ label: 'Annually (same date every year)', value: 'ANNUALLY' },
	];
	dayOfWeekOptions: { label: string; value: number }[] = [
		{ label: 'Monday', value: 1 },
		{ label: 'Tuesday', value: 2 },
		{ label: 'Wednesday', value: 3 },
		{ label: 'Thursday', value: 4 },
		{ label: 'Friday', value: 5 },
		{ label: 'Saturday', value: 6 },
		{ label: 'Sunday', value: 7 },
	];

	form = {
		title: '',
		recurrenceType: 'WEEKLY' as RecurrenceType,
		time: '17:00',
		startFrom: null as Date | null,
		endAt: null as Date | null,
		dayOfWeek: 1 as number | null,
		dayOfMonth: 25 as number | null,
		month: 1 as number | null,
		durationMinutes: 60,
		allDay: false,
		backgroundColor: '#3498db',
		location: '',
		description: '',
	};

	loading = false;

	constructor(
		private calendarEventService: CalendarEventService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private cdr: ChangeDetectorRef
	) {
		const now = new Date();
		this.form.startFrom = new Date(now.getFullYear(), now.getMonth(), 1);
		this.form.endAt = new Date(now.getFullYear() + 1, 11, 31);
	}

	private formatDateOnly(d: Date | null): string {
		if (!d) return '';
		const date = d instanceof Date ? d : new Date(d);
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}

	save() {
		const f = this.form;
		if (!f.title?.trim()) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please enter a title',
			});
			return;
		}
		if (!f.startFrom || !f.endAt) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please set Start date and End date',
			});
			return;
		}
		const startFromStr = this.formatDateOnly(f.startFrom);
		const endAtStr = this.formatDateOnly(f.endAt);
		if (startFromStr > endAtStr) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Start date must be on or before End date',
			});
			return;
		}
		if (f.recurrenceType === 'WEEKLY' && (f.dayOfWeek == null || f.dayOfWeek < 1 || f.dayOfWeek > 7)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please select day of week for weekly recurrence',
			});
			return;
		}
		if ((f.recurrenceType === 'MONTHLY' || f.recurrenceType === 'ANNUALLY') && (f.dayOfMonth == null || f.dayOfMonth < 1 || f.dayOfMonth > 31)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please set day of month (1–31)',
			});
			return;
		}
		if (f.recurrenceType === 'ANNUALLY' && (f.month == null || f.month < 1 || f.month > 12)) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please set month (1–12) for annual recurrence',
			});
			return;
		}

		const dto: CreateRecurringCalendarEventDto = {
			title: f.title.trim(),
			recurrenceType: f.recurrenceType,
			time: f.time || '17:00',
			startFrom: startFromStr,
			endAt: endAtStr,
			durationMinutes: Math.min(1440, Math.max(1, f.durationMinutes || 60)),
			allDay: f.allDay,
			backgroundColor: f.backgroundColor,
			borderColor: f.backgroundColor,
			textColor: '#ffffff',
			location: f.location?.trim() || undefined,
			description: f.description?.trim() || undefined,
		};
		if (f.recurrenceType === 'WEEKLY') {
			dto.dayOfWeek = f.dayOfWeek!;
		}
		if (f.recurrenceType === 'MONTHLY' || f.recurrenceType === 'ANNUALLY') {
			dto.dayOfMonth = f.dayOfMonth!;
		}
		if (f.recurrenceType === 'ANNUALLY') {
			dto.month = f.month!;
		}

		this.loading = true;
		this.cdr.markForCheck();

		this.calendarEventService.createRecurringCalendarEvents(dto).subscribe({
			next: (events) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: `Created ${events.length} recurring event(s)`,
				});
				this.ref.close(true);
			},
			error: (error: unknown) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: (error as { error?: { message?: string } })?.error?.message || 'Failed to create recurring events',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	cancel() {
		this.ref.close(false);
	}
}
