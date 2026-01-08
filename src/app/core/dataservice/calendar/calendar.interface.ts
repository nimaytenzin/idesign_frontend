// Event Model
export interface Event {
	id: number;
	title: string;
	description: string | null;
	startDate: string; // ISO 8601 datetime
	endDate: string; // ISO 8601 datetime
	location: string | null;
	eventTypeId: number;
	eventCategoryId: number | null;
	createdById: number;
	isAllDay: boolean;
	createdAt: string;
	updatedAt: string;
	eventType?: EventType;
	eventCategory?: EventCategory;
	createdBy?: {
		id: number;
		name: string;
		emailAddress: string;
	};
}

// EventType Model
export interface EventType {
	id: number;
	name: string;
	description: string | null;
	color: string | null;
	createdAt: string;
	updatedAt: string;
}

// EventCategory Model
export interface EventCategory {
	id: number;
	name: string;
	description: string | null;
	color: string | null;
	createdAt: string;
	updatedAt: string;
}

// DTOs for creating events
export interface CreateEventDto {
	title: string;
	description?: string;
	startDate: string; // ISO 8601 datetime
	endDate: string; // ISO 8601 datetime
	location?: string;
	eventTypeId: number;
	eventCategoryId?: number;
	isAllDay?: boolean;
}

// DTOs for updating events
export interface UpdateEventDto {
	title?: string;
	description?: string;
	startDate?: string; // ISO 8601 datetime
	endDate?: string; // ISO 8601 datetime
	location?: string;
	eventTypeId?: number;
	eventCategoryId?: number;
	isAllDay?: boolean;
}

// DTOs for creating event types
export interface CreateEventTypeDto {
	name: string;
	description?: string;
	color?: string;
}

// DTOs for updating event types
export interface UpdateEventTypeDto {
	name?: string;
	description?: string;
	color?: string;
}

// DTOs for creating event categories
export interface CreateEventCategoryDto {
	name: string;
	description?: string;
	color?: string;
}

// DTOs for updating event categories
export interface UpdateEventCategoryDto {
	name?: string;
	description?: string;
	color?: string;
}

// Query parameters for filtering events
export interface EventQueryDto {
	view?: 'day' | 'week' | 'month' | 'list';
	startDate?: string; // ISO 8601 date
	endDate?: string; // ISO 8601 date
	eventTypeId?: number;
	eventCategoryId?: number;
}

