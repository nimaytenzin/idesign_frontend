import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { Document } from '../../../../core/dataservice/documents/document/document.interface';
import { DocumentService } from '../../../../core/dataservice/documents/document/document.service';
import { MessageService } from 'primeng/api';

@Component({
	selector: 'app-document-preview',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		ProgressSpinnerModule,
		MessageModule,
		ToastModule,
	],
	providers: [MessageService],
	templateUrl: './document-preview.component.html',
})
export class DocumentPreviewComponent implements OnInit, OnDestroy {
	public document: Document;
	public loading: boolean = true;
	public previewUrl: string | null = null;
	public safePreviewUrl: SafeResourceUrl | null = null;
	public previewError: string | null = null;
	public isSupported: boolean = false;
	public fileType: string = '';

	constructor(
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig,
		private documentService: DocumentService,
		private messageService: MessageService,
		private sanitizer: DomSanitizer
	) {
		this.document = this.config.data?.document;
	}

	ngOnInit(): void {
		if (!this.document) {
			this.previewError = 'No document provided';
			this.loading = false;
			return;
		}

		this.fileType = this.document.fileType?.toLowerCase() || '';
		this.checkSupportAndLoad();
	}

	ngOnDestroy(): void {
		// Clean up object URL to prevent memory leaks
		if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(this.previewUrl);
		}
	}

	private checkSupportAndLoad(): void {
		const type = this.fileType;

		// Check if file type is supported for preview
		if (type.includes('pdf')) {
			this.isSupported = true;
			this.loadDocument();
		} else if (type.includes('word') || type.includes('doc') || type.includes('docx')) {
			this.isSupported = true;
			this.loadDocument();
		} else if (type.includes('excel') || type.includes('xls') || type.includes('xlsx')) {
			this.isSupported = false;
			this.loading = false;
			this.previewError = 'Excel files are not supported for preview. Please download the file to view it.';
		} else {
			this.isSupported = false;
			this.loading = false;
			this.previewError = `Preview is not available for ${this.document.fileType || 'this file type'}. Please download the file to view it.`;
		}
	}

	private loadDocument(): void {
		this.loading = true;
		this.documentService.downloadDocument(this.document.documentId).subscribe({
			next: (blob) => {
				console.log(blob);
				// Create object URL for preview
				this.previewUrl = URL.createObjectURL(blob);
				// Sanitize the URL for use in iframe
				this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
				this.loading = false;
			},
			error: (error) => {
				this.loading = false;
				this.previewError = 'Failed to load document. Please try downloading it instead.';
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load document for preview',
				});
			},
		});
	}

	public getWordViewerUrl(): string {
		// Try to use Google Docs Viewer for Word documents
		// Note: This requires the file to be publicly accessible
		// For blob URLs, we'll show a download message instead
		if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
			// Blob URLs won't work with Google Docs Viewer, so return empty
			return '';
		}
		// If we had a public URL, we could use:
		// return `https://docs.google.com/viewer?url=${encodeURIComponent(this.previewUrl)}&embedded=true`;
		return '';
	}

	public downloadDocument(): void {
		this.loading = true;
		this.documentService.downloadDocument(this.document.documentId).subscribe({
			next: (blob) => {
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = this.document.fileName;
				link.click();
				window.URL.revokeObjectURL(url);
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Document downloaded successfully',
				});
				this.loading = false;
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to download document',
				});
				this.loading = false;
			},
		});
	}

	public close(): void {
		this.ref.close();
	}

	public isPdf(): boolean {
		return this.fileType.includes('pdf');
	}

	public isWord(): boolean {
		return this.fileType.includes('word') || this.fileType.includes('doc');
	}

	public getOfficeViewerUrl(): string {
		// Microsoft Office Online Viewer URL
		// Note: This requires the file to be publicly accessible or use a signed URL
		// For now, we'll use the blob URL directly for Word documents
		return this.previewUrl || '';
	}

	public getFileIcon(): string {
		if (!this.fileType) return 'pi-file';
		const type = this.fileType.toLowerCase();
		if (type.includes('pdf')) return 'pi-file-pdf';
		if (type.includes('word') || type.includes('doc')) return 'pi-file-word';
		if (type.includes('excel') || type.includes('sheet')) return 'pi-file-excel';
		if (type.includes('image')) return 'pi-image';
		if (type.includes('zip') || type.includes('rar')) return 'pi-file-archive';
		return 'pi-file';
	}

	public formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
}
