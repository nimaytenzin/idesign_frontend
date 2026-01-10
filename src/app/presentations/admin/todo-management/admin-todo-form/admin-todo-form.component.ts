import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {
	TodoService,
	Todo,
	Portfolio,
	CreateTodoDto,
	UpdateTodoDto,
	TodoStatus,
} from '../../../../core/dataservice';
import { PrimeNgModules } from '../../../../primeng.modules';
import { User } from '../../../../core/dataservice/user/user.interface';
import { UserDataService } from '../../../../core/dataservice/user/user.dataservice';

@Component({
	selector: 'app-admin-todo-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-todo-form.component.html',
	styleUrls: ['./admin-todo-form.component.scss'],
})
export class AdminTodoFormComponent implements OnInit {
	todo: Todo | null = null;
	portfolios: Portfolio[] = [];
	employees: User[] = [];

	// Form fields
	task: string = '';
	description: string = '';
	portfolioId: number | null = null;
	assignedUserIds: number[] = [];
	assignedDate: Date | null = null;
	dueBy: Date | null = null;
	status: TodoStatus = 'PENDING';

	loading: boolean = false;
	isEditMode: boolean = false;

	statusOptions = [
		{ label: 'Pending', value: 'PENDING' as TodoStatus },
		{ label: 'Completed', value: 'COMPLETED' as TodoStatus },
	];

	constructor(
		private todoService: TodoService,
		private userDataService: UserDataService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig
	) {
		if (this.config.data) {
			this.todo = this.config.data.todo;
			this.portfolios = this.config.data.portfolios || [];
			// If employees are provided in config, use them; otherwise load from service
			if (this.config.data.employees && this.config.data.employees.length > 0) {
				this.employees = this.config.data.employees;
			}
		}
	}

	ngOnInit() {
		// Load employees if not already provided
		if (!this.employees || this.employees.length === 0) {
			this.loadEmployees();
		}
		
		if (this.todo) {
			this.isEditMode = true;
			this.task = this.todo.task;
			this.description = this.todo.description || '';
			this.portfolioId = this.todo.portfolioId;
			this.assignedUserIds = this.todo.assignedUsers?.map((u: any) => u.id) || [];
			this.status = this.todo.status;

			if (this.todo.assignedDate) {
				this.assignedDate = new Date(this.todo.assignedDate);
			}
			if (this.todo.dueBy) {
				this.dueBy = new Date(this.todo.dueBy);
			}
		}
	}

	loadEmployees() {
		this.loading = true;
		this.userDataService.getAdminAndStaffUsers().subscribe({
			next: (users) => {
				this.employees = users;
				this.loading = false;
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load users',
				});
				this.loading = false;
			},
		});
	}

	onSubmit() {
		if (!this.task || !this.task.trim()) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Task is required',
			});
			return;
		}

		if (!this.portfolioId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Portfolio is required',
			});
			return;
		}

		if (!this.assignedUserIds || this.assignedUserIds.length === 0) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'At least one user must be assigned',
			});
			return;
		}

		this.loading = true;

		// Ensure portfolioId and assignedUserIds are numbers
		const portfolioId = typeof this.portfolioId === 'string' 
			? parseInt(this.portfolioId, 10) 
			: Number(this.portfolioId);
		
		const assignedUserIds = this.assignedUserIds.map(id => 
			typeof id === 'string' ? parseInt(id, 10) : Number(id)
		);

		const dto: CreateTodoDto | UpdateTodoDto = {
			task: this.task.trim(),
			description: this.description.trim() || undefined,
			portfolioId: portfolioId,
			assignedUserIds: assignedUserIds,
			status: this.status,
		};

		if (this.assignedDate) {
			dto.assignedDate = this.formatDateTime(this.assignedDate);
		}

		if (this.dueBy) {
			dto.dueBy = this.formatDateTime(this.dueBy);
		} else if (this.isEditMode) {
			(dto as UpdateTodoDto).dueBy = null;
		}

		if (this.isEditMode && this.todo) {
			this.todoService.updateTodo(this.todo.id, dto as UpdateTodoDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Todo updated successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error: any) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update todo',
					});
					this.loading = false;
				},
			});
		} else {
			this.todoService.createTodo(dto as CreateTodoDto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Todo created successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error: any) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create todo',
					});
					this.loading = false;
				},
			});
		}
	}

	onCancel() {
		this.ref.close(false);
	}

	formatDateTime(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
	}
}

