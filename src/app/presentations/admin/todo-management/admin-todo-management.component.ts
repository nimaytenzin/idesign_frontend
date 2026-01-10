import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';

import { AdminTodoFormComponent } from './admin-todo-form/admin-todo-form.component';
import { AdminPortfolioFormComponent } from './admin-portfolio-form/admin-portfolio-form.component';
import { Todo, Portfolio, TodoStatus, TodoService,  TodoQueryDto } from '../../../core/dataservice';
import { PrimeNgModules } from '../../../primeng.modules';
import { User } from '../../../core/dataservice/user/user.interface';
@Component({
	selector: 'app-admin-todo-management',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-todo-management.component.html',
	styleUrls: ['./admin-todo-management.component.scss'],
})
export class AdminTodoManagementComponent implements OnInit {
	@ViewChild('todoTable') todoTable!: Table;
	@ViewChild('portfolioTable') portfolioTable!: Table;

	// Active tab
	activeTabIndex: number = 0;

	// Todos
	todos: Todo[] = [];
	selectedTodos: Todo[] = [];
	todosLoading: boolean = false;
	todosGlobalFilter: string = '';

	// Portfolios
	portfolios: Portfolio[] = [];
	selectedPortfolios: Portfolio[] = [];
	portfoliosLoading: boolean = false;
	portfoliosGlobalFilter: string = '';

	// Filters for Todos
	portfolioFilter: number | null = null;
	statusFilter: TodoStatus | null = null;
	assignedUserFilter: number | null = null;
	startDateFilter: Date | null = null;
	endDateFilter: Date | null = null;

	// Employees for dropdown
	employees: User[] = [];

	// Filter options
	statusOptions = [
		{ label: 'All Status', value: null },
		{ label: 'Pending', value: 'PENDING' as TodoStatus },
		{ label: 'Completed', value: 'COMPLETED' as TodoStatus },
	];

	// Pagination
	todosFirst: number = 0;
	todosRows: number = 10;
	todosTotalRecords: number = 0;

	portfoliosFirst: number = 0;
	portfoliosRows: number = 10;
	portfoliosTotalRecords: number = 0;

	// Expose TodoStatus enum values for template
	readonly TodoStatusEnum = {
		PENDING: 'PENDING' as TodoStatus,
		COMPLETED: 'COMPLETED' as TodoStatus,
	};

	constructor(
		private todoService: TodoService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadPortfolios();
		this.loadTodos();
		this.loadEmployees();
	}

	// Portfolio Methods
	loadPortfolios() {
		this.portfoliosLoading = true;
		this.todoService.getAllPortfolios().subscribe({
			next: (data: Portfolio[]) => {
				this.portfolios = data;
				this.portfoliosTotalRecords = data.length;
				this.portfoliosLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load portfolios',
				});
				this.portfoliosLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openNewPortfolio() {
		const ref = this.dialogService.open(AdminPortfolioFormComponent, {
			header: 'Create New Portfolio',
			width: '500px',
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadPortfolios();
			}
		});
	}

	editPortfolio(portfolio: Portfolio) {
		const ref = this.dialogService.open(AdminPortfolioFormComponent, {
			header: 'Edit Portfolio',
			width: '500px',
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { portfolio },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadPortfolios();
				this.loadTodos(); // Reload todos in case portfolio name changed
			}
		});
	}

	deletePortfolio(portfolio: Portfolio) {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete portfolio "${portfolio.name}"? This will remove the portfolio association from all related todos.`,
			header: 'Confirm Deletion',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.todoService.deletePortfolio(portfolio.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Portfolio deleted successfully',
						});
						this.loadPortfolios();
						this.loadTodos(); // Reload todos to reflect portfolio deletion
					},
					error: (error: any) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete portfolio',
						});
					},
				});
			},
		});
	}

	// Todo Methods
	loadTodos() {
		this.todosLoading = true;
		const query: TodoQueryDto = {};

		if (this.portfolioFilter) {
			// Ensure portfolioId is a number
			query.portfolioId = typeof this.portfolioFilter === 'string' 
				? parseInt(this.portfolioFilter, 10) 
				: Number(this.portfolioFilter);
		}
		if (this.statusFilter) {
			query.status = this.statusFilter;
		}
		if (this.assignedUserFilter) {
			// Ensure assignedUserId is a number
			query.assignedUserId = typeof this.assignedUserFilter === 'string' 
				? parseInt(this.assignedUserFilter, 10) 
				: Number(this.assignedUserFilter);
		}
		if (this.startDateFilter && this.endDateFilter) {
			query.startDate = this.formatDate(this.startDateFilter);
			query.endDate = this.formatDate(this.endDateFilter);
		}

		this.todoService.getAllTodos(query).subscribe({
			next: (data: Todo[]) => {
				this.todos = data;
				this.todosTotalRecords = data.length;
				this.todosLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load todos',
				});
				this.todosLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	loadEmployees() {
		 
	}

	openNewTodo() {
		const ref = this.dialogService.open(AdminTodoFormComponent, {
			header: 'Create New Todo',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { portfolios: this.portfolios, employees: this.employees },
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadTodos();
			}
		});
	}

	editTodo(todo: Todo) {
		const ref = this.dialogService.open(AdminTodoFormComponent, {
			header: 'Edit Todo',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				todo,
				portfolios: this.portfolios,
				employees: this.employees,
			},
		});

		ref.onClose.subscribe((success: boolean) => {
			if (success) {
				this.loadTodos();
			}
		});
	}

	deleteTodo(todo: Todo) {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete todo "${todo.task}"?`,
			header: 'Confirm Deletion',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.todoService.deleteTodo(todo.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Todo deleted successfully',
						});
						this.loadTodos();
					},
					error: (error: any) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete todo',
						});
					},
				});
			},
		});
	}

	toggleTodoStatus(todo: Todo) {
		const newStatus: TodoStatus = todo.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
		this.todoService.updateTodo(todo.id, { status: newStatus }).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: `Todo marked as ${newStatus}`,
				});
				this.loadTodos();
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

	// Filter Methods
	onTodoFilterChange() {
		this.loadTodos();
	}

	clearTodoFilters() {
		this.portfolioFilter = null;
		this.statusFilter = null;
		this.assignedUserFilter = null;
		this.startDateFilter = null;
		this.endDateFilter = null;
		this.todosGlobalFilter = '';
		if (this.todoTable) {
			this.todoTable.clear();
		}
		this.loadTodos();
	}

	clearPortfolioFilters() {
		this.portfoliosGlobalFilter = '';
		if (this.portfolioTable) {
			this.portfolioTable.clear();
		}
	}

	// Pagination
	onTodosPageChange(event: any): void {
		this.todosFirst = event.first;
		this.todosRows = event.rows;
	}

	onPortfoliosPageChange(event: any): void {
		this.portfoliosFirst = event.first;
		this.portfoliosRows = event.rows;
	}

	// Utility Methods
	formatDate(date: Date): string {
		if (!date) return '';
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	formatDateTime(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	getPortfolioName(portfolioId: number): string {
		const portfolio = this.portfolios.find((p) => p.id === portfolioId);
		return portfolio ? portfolio.name : 'Unknown';
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

	onGlobalFilter(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (target && this.todoTable) {
			this.todoTable.filterGlobal(target.value, 'contains');
		}
	}

	onPortfolioGlobalFilter(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (target && this.portfolioTable) {
			this.portfolioTable.filterGlobal(target.value, 'contains');
		}
	}
}

