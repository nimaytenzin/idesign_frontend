import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrderService } from '../../../../core/dataservice/order/order.service';
import { PrimeNgModules } from '../../../../primeng.modules';
import { PaymentStatus } from '../../../../core/constants/enums';
import { Order, OrderItem } from '../../../../core/dataservice';

@Component({
	selector: 'app-admin-view-invoice',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './admin-view-invoice.component.html',
	styleUrls: ['./admin-view-invoice.component.scss'],
})
export class AdminViewInvoiceComponent implements OnInit {
	@ViewChild('invoiceContent', { static: false }) invoiceContent!: ElementRef;
	
	order: Order | null = null;
	loading: boolean = false;
	PaymentStatus = PaymentStatus;

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

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}

	/**
	 * Get the discount to display for an order item.
	 * When no discount was applied (lineTotal === unitPrice * quantity), show 0
	 * even if discountApplied was incorrectly set to the full amount by the backend.
	 */
	getItemDiscountDisplay(item: OrderItem): number {
		const preDiscount = (item.unitPrice ?? 0) * (item.quantity ?? 0);
		if (preDiscount > 0 && (item.lineTotal ?? 0) === preDiscount) {
			return 0;
		}
		return item.discountApplied ?? 0;
	}

	formatDate(date: Date | string | null | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	formatPaymentMethod(method: string): string {
		const methodMap: { [key: string]: string } = {
			'CASH': 'Cash',
			'MBOB': 'MBOB',
			'BDB_EPAY': 'BDB EPay',
			'TPAY': 'TPay',
			'BNB_MPAY': 'BNB MPay',
			'ZPSS': 'ZPSS',
		};
		return methodMap[method] || method;
	}

	hasDeliveryInfo(): boolean {
		if (!this.order) return false;
		return !!(
			this.order.shippingAddress ||
			this.order.deliveryNotes ||
			this.order.deliveryLocation ||
			this.order.deliveryMode ||
			this.order.driverName ||
			this.order.driverPhone ||
			this.order.vehicleNumber ||
			this.order.expectedDeliveryDate
		);
	}

	async downloadAsPDF() {
		if (!this.invoiceContent || !this.order) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Invoice content not found',
			});
			return;
		}

		try {
			// Dynamic imports
			const html2canvas = (await import('html2canvas')).default;
			const { jsPDF } = await import('jspdf');
			
			const element = this.invoiceContent.nativeElement;
			
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
			pdf.save(`Invoice-${this.order.orderNumber}.pdf`);
			
			this.messageService.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Invoice downloaded as PDF',
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

	printInvoice() {
		if (!this.invoiceContent || !this.order) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Invoice content not found',
			});
			return;
		}

		const printContent = this.invoiceContent.nativeElement.innerHTML;
		const printWindow = window.open('', '_blank');
		
		if (printWindow) {
			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
					<head>
						<title>Invoice - ${this.order.orderNumber}</title>
						<style>
							body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
							@media print {
								body { padding: 0; }
							}
						</style>
					</head>
					<body>
						${printContent}
					</body>
				</html>
			`);
			printWindow.document.close();
			printWindow.focus();
			
			// Wait for content to load, then print
			setTimeout(() => {
				printWindow.print();
				printWindow.close();
			}, 250);
		} else {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Please allow popups to print the invoice',
			});
		}
	}

	close() {
		this.ref.close();
	}
}

