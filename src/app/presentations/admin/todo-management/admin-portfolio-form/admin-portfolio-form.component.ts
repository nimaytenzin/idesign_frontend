import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {
	TodoService,
	Portfolio,
	CreatePortfolioDto,
	UpdatePortfolioDto,
} from '../../../../core/dataservice';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-portfolio-form',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-portfolio-form.component.html',
	styleUrls: ['./admin-portfolio-form.component.scss'],
})
export class AdminPortfolioFormComponent implements OnInit {
	portfolio: Portfolio | null = null;

	// Form fields
	name: string = '';

	loading: boolean = false;
	isEditMode: boolean = false;

	constructor(
		private todoService: TodoService,
		private messageService: MessageService,
		private ref: DynamicDialogRef,
		private config: DynamicDialogConfig
	) {
		if (this.config.data) {
			this.portfolio = this.config.data.portfolio;
		}
	}

	ngOnInit() {
		if (this.portfolio) {
			this.isEditMode = true;
			this.name = this.portfolio.name;
		}
	}

	onSubmit() {
		if (!this.name || !this.name.trim()) {
			this.messageService.add({
				severity: 'error',
				summary: 'Validation Error',
				detail: 'Portfolio name is required',
			});
			return;
		}

		this.loading = true;

		if (this.isEditMode && this.portfolio) {
			const dto: UpdatePortfolioDto = {
				name: this.name.trim(),
			};

			this.todoService.updatePortfolio(this.portfolio.id, dto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Portfolio updated successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error: any) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to update portfolio',
					});
					this.loading = false;
				},
			});
		} else {
			const dto: CreatePortfolioDto = {
				name: this.name.trim(),
			};

			this.todoService.createPortfolio(dto).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Portfolio created successfully',
					});
					this.loading = false;
					this.ref.close(true);
				},
				error: (error: any) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to create portfolio',
					});
					this.loading = false;
				},
			});
		}
	}

	onCancel() {
		this.ref.close(false);
	}
}

