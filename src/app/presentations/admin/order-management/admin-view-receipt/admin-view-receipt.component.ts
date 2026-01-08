import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { Order } from '../../../../core/dataservice/order/order.interface';
import { PaymentMethod } from '../../../../core/dataservice/account/account.interface';
import { PrimeNgModules } from '../../../../primeng.modules';

@Component({
	selector: 'app-admin-view-receipt',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-view-receipt.component.html',
	styleUrls: ['./admin-view-receipt.component.scss'],
})
export class AdminViewReceiptComponent implements OnInit {
	@ViewChild('receiptContent', { static: false }) receiptContent!: ElementRef;
	
	order: Order | null = null;
	loading: boolean = false;

	constructor(
		private orderService: OrderService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit() {
		const orderId = this.config.data?.orderId;
		if (orderId) {
			this.loadOrder(orderId);
		} else if (this.config.data?.order) {
			this.order = this.config.data.order;
		}
	}

	loadOrder(id: number) {
		this.loading = true;
		this.orderService.getOrderById(id).subscribe({
			next: (data) => {
				this.order = data;
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load order',
				});
				this.loading = false;
				this.ref.close();
				this.cdr.markForCheck();
			},
		});
	}

	getPaymentMethodLabel(method?: PaymentMethod | null): string {
		if (!method) return 'N/A';
		switch (method) {
			case 'CASH':
				return 'Cash';
			case 'MBOB':
			return 'MBOB';
			case 'BDB_EPAY':
			return 'BDB EPay';
			case 'TPAY':
			return 'TPay';
			case 'BNB_MPAY':
			return 'BNB MPay';
			case 'ZPSS':
			return 'ZPSS';
			default:
				return 'Unknown';
		}
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	async downloadAsPDF() {
		if (!this.receiptContent || !this.order) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Receipt content not found',
			});
			return;
		}

		try {
			// Dynamic imports
			const html2canvas = (await import('html2canvas')).default;
			const { jsPDF } = await import('jspdf');
			
			const element = this.receiptContent.nativeElement;
			
			// Generate canvas from HTML
			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
			});

			const imgData = canvas.toDataURL('image/png');
			
			// Create PDF
			const pdf = new jsPDF('p', 'mm', 'a4');
			const imgWidth = 210; // A4 width in mm
			const pageHeight = 295; // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;
			let position = 0;

			// Add first page
			pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			// Add additional pages if needed
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			// Save PDF
			const receiptNum = this.order.receiptNumber || this.order.orderNumber;
			pdf.save(`Receipt-${receiptNum}.pdf`);
			
			this.messageService.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Receipt downloaded as PDF',
			});
		} catch (error) {
			console.error('PDF generation error:', error);
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to generate PDF',
			});
		}
	}

	async shareAsImage() {
		if (!this.receiptContent || !this.order) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Receipt content not found',
			});
			return;
		}

		try {
			// Dynamic import of html2canvas
			const html2canvas = (await import('html2canvas')).default;
			
			const element = this.receiptContent.nativeElement;
			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
			});

			canvas.toBlob((blob) => {
				if (blob) {
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = `Receipt-${this.order?.receiptNumber || this.order?.orderNumber}.png`;
					link.click();
					URL.revokeObjectURL(url);
					
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Receipt downloaded as image',
					});
				}
			}, 'image/png');
		} catch (error) {
			console.error('Image generation error:', error);
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to generate image',
			});
		}
	}

	close() {
		this.ref.close();
	}
}

