import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PrimeNgModules } from '../../../../primeng.modules';
import {
	CalendarEventService,
	CreateCalendarEventDto,
	UpdateCalendarEventDto,
} from '../../../../core/dataservice';

export interface CalendarEventFormData {
	title: string;
	description: string;
	startDate: Date | null;
	endDate: Date | null;
	location: string;
	color: string;
	isAllDay: boolean;
}

export interface CalendarEventFormDialogData {
	mode: 'create' | 'edit';
	eventId?: number;
	initialForm: CalendarEventFormData;
}

@Component({
	selector: 'app-calendar-event-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, ConfirmationService],
	templateUrl: './calendar-event-form.component.html',
	styleUrl: './calendar-event-form.component.scss',
})
export class CalendarEventFormComponent {
	eventForm: CalendarEventFormData = {
		title: '',
		description: '',
		startDate: null,
		endDate: null,
		location: '',
		color: '#3498db',
		isAllDay: false,
	};

	mode: 'create' | 'edit' = 'create';
	eventId: number | null = null;
	loading = false;

	constructor(
		private calendarEventService: CalendarEventService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig,
		private cdr: ChangeDetectorRef
	) {
		const data = this.config.data as CalendarEventFormDialogData | undefined;
		if (data?.initialForm) {
			this.eventForm = { ...data.initialForm };
		}
		if (data?.mode) {
			this.mode = data.mode;
		}
		if (data?.eventId != null) {
			this.eventId = data.eventId;
		}
	}

	get isEditMode(): boolean {
		return this.mode === 'edit' && this.eventId != null;
	}

	save() {
		if (!this.eventForm.title?.trim() || !this.eventForm.startDate) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields',
			});
			return;
		}

		this.loading = true;
		this.cdr.markForCheck();

		if (this.isEditMode && this.eventId != null) {
			const updateDto: UpdateCalendarEventDto = {
				title: this.eventForm.title.trim(),
				start: this.eventForm.startDate.toISOString(),
				end: this.eventForm.endDate ? this.eventForm.endDate.toISOString() : undefined,
				allDay: this.eventForm.isAllDay,
				backgroundColor: this.eventForm.color,
				borderColor: this.eventForm.color,
				textColor: '#ffffff',
				location: this.eventForm.location?.trim() || undefined,
				description: this.eventForm.description?.trim() || undefined,
			};

			this.calendarEventService.updateCalendarEvent(this.eventId, updateDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Event updated successfully',
					});
					this.ref.close(true);
				},
				error: (error: { error?: { message?: string } }) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update event',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			const createDto: CreateCalendarEventDto = {
				title: this.eventForm.title.trim(),
				start: this.eventForm.startDate.toISOString(),
				end: this.eventForm.endDate ? this.eventForm.endDate.toISOString() : undefined,
				allDay: this.eventForm.isAllDay ?? false,
				backgroundColor: this.eventForm.color,
				borderColor: this.eventForm.color,
				textColor: '#ffffff',
				location: this.eventForm.location?.trim() || undefined,
				description: this.eventForm.description?.trim() || undefined,
			};

			this.calendarEventService.createCalendarEvent(createDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Event created successfully',
					});
					this.ref.close(true);
				},
				error: (error: { error?: { message?: string } }) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create event',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	deleteEvent() {
		if (!this.eventId) return;

		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${this.eventForm.title}"?`,
			header: 'Confirm Deletion',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.cdr.markForCheck();
				this.calendarEventService.deleteCalendarEvent(this.eventId!).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Event deleted successfully',
						});
						this.ref.close(true);
					},
					error: (error: { error?: { message?: string } }) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete event',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
			},
		});
	}

	cancel() {
		this.ref.close(false);
	}
}
