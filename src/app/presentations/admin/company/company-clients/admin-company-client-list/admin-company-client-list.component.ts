import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CompanyClientService } from '../../../../../core/dataservice/company-client/company-client.service';
import { CompanyClient } from '../../../../../core/dataservice/company-client/company-client.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { environment } from '../../../../../../environments/environment';
import { AdminCompanyClientFormComponent } from '../admin-company-client-form/admin-company-client-form.component';

@Component({
	selector: 'app-admin-company-client-list',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-company-client-list.component.html',
	styleUrls: ['./admin-company-client-list.component.scss'],
})
export class AdminCompanyClientListComponent implements OnInit {
	clients: CompanyClient[] = [];
	loading = false;
	dialogRef?: DynamicDialogRef;

	constructor(
		private companyClientService: CompanyClientService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadClients();
	}

	loadClients(): void {
		this.loading = true;
		this.companyClientService.getAllCompanyClients().subscribe({
			next: (clients: CompanyClient[]) => {
				this.clients = clients;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load company clients',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openCreateDialog(): void {
		this.dialogRef = this.dialogService.open(AdminCompanyClientFormComponent, {
			header: 'Create New Company Client',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadClients();
			}
		});
	}

	openEditDialog(client: CompanyClient): void {
		this.dialogRef = this.dialogService.open(AdminCompanyClientFormComponent, {
			header: 'Edit Company Client',
			width: '90%',
			style: { 'max-width': '800px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				client: client,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadClients();
			}
		});
	}

	deleteClient(client: CompanyClient): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${client.name}"? This action cannot be undone.`,
			header: 'Delete Company Client',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.companyClientService.deleteCompanyClient(client.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Company client deleted successfully',
						});
						this.loadClients();
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed to delete company client',
						});
						this.loading = false;
						this.cdr.markForCheck();
					},
				});
			},
		});
	}

	toggleActive(client: CompanyClient): void {
		const updateData = {
			isActive: !client.isActive,
		};

		this.companyClientService
			.updateCompanyClientSimple(client.id, updateData)
			.subscribe({
				next: (updatedClient) => {
					client.isActive = updatedClient.isActive;
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: `Client ${updatedClient.isActive ? 'activated' : 'deactivated'} successfully`,
					});
					this.cdr.markForCheck();
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to update client status',
					});
					this.cdr.markForCheck();
				},
			});
	}

	getImageUrl(logoUri?: string): string {
		if (!logoUri) {
			return '/assets/images/no-image.png';
		}
		if (logoUri.startsWith('http')) {
			return logoUri;
		}
		return `${environment.BASEAPI_URL}${logoUri}`;
	}
}

