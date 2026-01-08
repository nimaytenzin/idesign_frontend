/**
 * Todo Management Interfaces
 * Based on the Todo Management API documentation
 */

/**
 * Status Enum
 */
export type TodoStatus = 'PENDING' | 'COMPLETED';

/**
 * Portfolio Interface
 */
export interface Portfolio {
	id: number;
	name: string;
	createdAt: string; // ISO 8601 datetime
	updatedAt: string; // ISO 8601 datetime
	todosCount?: number; // Optional, included in some responses
}

/**
 * User Interface (for assigned users and createdBy)
 */
export interface TodoUser {
	id: number;
	name: string;
	emailAddress: string;
}

/**
 * Todo Interface
 */
export interface Todo {
	id: number;
	task: string;
	description: string | null;
	status: TodoStatus;
	assignedDate: string; // ISO 8601 datetime
	dueBy: string | null; // ISO 8601 datetime
	portfolioId: number;
	createdById: number;
	createdAt: string; // ISO 8601 datetime
	updatedAt: string; // ISO 8601 datetime
	portfolio?: Portfolio;
	createdBy?: TodoUser;
	assignedUsers?: TodoUser[];
}

/**
 * Create Portfolio DTO
 */
export interface CreatePortfolioDto {
	name: string;
}

/**
 * Update Portfolio DTO
 */
export interface UpdatePortfolioDto {
	name?: string;
}

/**
 * Create Todo DTO
 */
export interface CreateTodoDto {
	task: string;
	description?: string;
	portfolioId: number;
	assignedUserIds: number[]; // Minimum 1 user required
	assignedDate?: string; // ISO 8601 datetime (defaults to current time if not provided)
	dueBy?: string; // ISO 8601 datetime
	status?: TodoStatus; // Default: PENDING
}

/**
 * Update Todo DTO
 */
export interface UpdateTodoDto {
	task?: string;
	description?: string;
	portfolioId?: number;
	assignedUserIds?: number[]; // Minimum 1 user if provided
	assignedDate?: string; // ISO 8601 datetime
	dueBy?: string | null; // ISO 8601 datetime (can be null)
	status?: TodoStatus;
}

/**
 * Todo Query DTO (for filtering GET /todos)
 */
export interface TodoQueryDto {
	portfolioId?: number;
	status?: TodoStatus;
	assignedUserId?: number;
	startDate?: string; // ISO 8601 date (YYYY-MM-DD) - must be used with endDate
	endDate?: string; // ISO 8601 date (YYYY-MM-DD) - must be used with startDate
}

/**
 * Weekly View Response
 * Todos grouped by day of the week
 */
export interface WeeklyViewResponse {
	Monday: Todo[];
	Tuesday: Todo[];
	Wednesday: Todo[];
	Thursday: Todo[];
	Friday: Todo[];
	Saturday: Todo[];
	Sunday: Todo[];
}

