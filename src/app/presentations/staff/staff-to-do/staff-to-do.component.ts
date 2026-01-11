import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Todo, TodoStatus, TodoService, MarkCompleteDto } from '../../../core/dataservice';
import { PrimeNgModules } from '../../../primeng.modules';

@Component({
	selector: 'app-staff-to-do',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './staff-to-do.component.html',
	styleUrls: ['./staff-to-do.component.scss'],
})
export class StaffToDoComponent implements OnInit {
	// Tab management
	activeTabIndex: number = 0;

	// My Todos
	myTodos: Todo[] = [];
	myTodosLoading: boolean = false;

	// Completed Todos This Week
	completedTodosThisWeek: Todo[] = [];
	completedTodosLoading: boolean = false;

	// All Todos
	allTodos: Todo[] = [];
	allTodosLoading: boolean = false;

	// Shared properties
	todosLoading: boolean = false;

	// Dialog state
	showRemarksDialog: boolean = false;
	selectedTodo: Todo | null = null;
	remarks: string = '';

	// Expose TodoStatus enum values for template
	readonly TodoStatusEnum = {
		PENDING: 'PENDING' as TodoStatus,
		COMPLETED: 'COMPLETED' as TodoStatus,
	};

	constructor(
		private todoService: TodoService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadMyTodos();
		this.loadCompletedTodosThisWeek();
		this.loadAllTodos();
	}

	onTabChange() {
		if (this.activeTabIndex === 0) {
			this.loadMyTodos();
			this.loadCompletedTodosThisWeek();
		} else {
			this.loadAllTodos();
		}
	}

	// Load todos assigned to current user using staff endpoint
	loadMyTodos() {
		this.myTodosLoading = true;
		this.todosLoading = true;

		this.todoService.getMyTodos().subscribe({
			next: (data: Todo[]) => {
				this.myTodos = data;
				this.myTodosLoading = false;
				this.todosLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load your todos',
				});
				this.myTodosLoading = false;
				this.todosLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	// Load completed todos this week
	loadCompletedTodosThisWeek() {
		this.completedTodosLoading = true;

		this.todoService.getMyCompletedTodosThisWeek().subscribe({
			next: (data: Todo[]) => {
				this.completedTodosThisWeek = data;
				this.completedTodosLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load completed todos',
				});
				this.completedTodosLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	// Load all todos using staff endpoint
	loadAllTodos() {
		this.allTodosLoading = true;
		this.todosLoading = true;

		this.todoService.getAllTodosForStaff().subscribe({
			next: (data: Todo[]) => {
				this.allTodos = data;
				this.allTodosLoading = false;
				this.todosLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load todos',
				});
				this.allTodosLoading = false;
				this.todosLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	toggleTodoStatus(todo: Todo) {
		// If todo is PENDING, show dialog for remarks
		if (todo.status === 'PENDING') {
			this.selectedTodo = todo;
			this.remarks = '';
			this.showRemarksDialog = true;
		} else {
			// If todo is COMPLETED, toggle back to PENDING directly
			this.todoService.updateTodo(todo.id, { status: 'PENDING' }).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Todo marked as PENDING',
					});
					// Reload both tabs
					this.loadMyTodos();
					this.loadCompletedTodosThisWeek();
					this.loadAllTodos();
				},
				error: (error: any) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update todo status',
					});
				},
			});
		}
	}

	closeRemarksDialog() {
		this.showRemarksDialog = false;
		this.selectedTodo = null;
		this.remarks = '';
	}

	submitRemarks() {
		if (!this.selectedTodo) return;

		const dto: MarkCompleteDto = {
			remarks: this.remarks.trim() || undefined,
		};

		this.todoService.markAsComplete(this.selectedTodo.id, dto).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Todo marked as completed',
				});
				this.closeRemarksDialog();
				// Reload both tabs
				this.loadMyTodos();
				this.loadCompletedTodosThisWeek();
				this.loadAllTodos();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to mark todo as complete',
				});
			},
		});
	}

	// Utility Methods
	formatDate(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		
		// Check if it's today
		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		}
		
		// Check if it's tomorrow
		if (date.toDateString() === tomorrow.toDateString()) {
			return 'Tomorrow';
		}
		
		// Check if it's overdue
		if (date < today) {
			const diffTime = Math.abs(today.getTime() - date.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		}
		
		// Format as date
		return date.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric',
			year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
		});
	}

	getAssignedUsersNames(todo: Todo): string {
		if (!todo.assignedUsers || todo.assignedUsers.length === 0) {
			return 'Unassigned';
		}
		return todo.assignedUsers.map((user: any) => user.name).join(', ');
	}

	isOverdue(todo: Todo): boolean {
		if (!todo.dueBy || todo.status === 'COMPLETED') {
			return false;
		}
		return new Date(todo.dueBy) < new Date();
	}
}
