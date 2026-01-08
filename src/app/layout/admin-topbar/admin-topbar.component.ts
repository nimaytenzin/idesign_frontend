import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AdminLayoutService } from '../service/admin-layout.service';
import { Router } from '@angular/router';

import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CommonModule, DatePipe } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SidebarModule } from 'primeng/sidebar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
	selector: 'app-admin-topbar',
	templateUrl: './admin-topbar.component.html',
	styleUrls: ['./admin-topbar.component.scss'],
	standalone: true,
	imports: [
		OverlayPanelModule,
		CommonModule,
		DividerModule,
		ButtonModule,
		PasswordModule,
		ToastModule,
		ConfirmPopupModule,
		SidebarModule,
		DialogModule,
		FormsModule,
		InputTextModule,
		AvatarModule,
		TooltipModule,
	],
	providers: [ConfirmationService, MessageService, DatePipe],
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
	items!: MenuItem[];
	@ViewChild('menubutton') menuButton!: ElementRef;

	@ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

	@ViewChild('topbarmenu') menu!: ElementRef;

	profileSideBarVisible: boolean = false;

	currentDate: Date = new Date();
	currentTime: string = '';
	private timeInterval: any;

	// Simple dummy user profile
	userProfile = {
		firstName: 'iDesign',
		lastName: 'Admin',
		name: 'iDesign Admin',
		email: 'admin@idesign.bt',
		phoneNumber: '+975 17 123 456',
		role: 'Administrator',
		profileImage: '', // No image, will show initials
		createdAt: new Date('2024-01-01'), // Dummy creation date
	};

	constructor(
		public layoutService: AdminLayoutService,
		private confirmationService: ConfirmationService,
		private messageService: MessageService,
		private router: Router,
		private datePipe: DatePipe
	) {}

	ngOnInit(): void {
		this.updateTime();
		// Update time every second
		this.timeInterval = setInterval(() => {
			this.currentDate = new Date();
			this.updateTime();
		}, 1000);
	}

	ngOnDestroy(): void {
		if (this.timeInterval) {
			clearInterval(this.timeInterval);
		}
	}

	private updateTime(): void {
		this.currentTime = this.datePipe.transform(this.currentDate, 'hh:mm:ss a') || '';
	}

	logout() {
		this.confirmationService.confirm({
			target: event?.target as EventTarget,
			message: 'Are you sure you want to sign out?',
			header: 'Confirm Sign Out',
			icon: 'pi pi-sign-out',
			acceptIcon: 'none',
			rejectIcon: 'none',
			rejectButtonStyleClass: 'p-button-text',
			accept: () => {
				// Clear authentication
				localStorage.removeItem('isAuthenticated');
				localStorage.removeItem('userRole');

				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'You have been signed out successfully',
				});

				// Navigate to login after a short delay
				setTimeout(() => {
					this.router.navigate(['/auth/login']);
				}, 1000);
			},
			reject: () => {
				// User cancelled logout - do nothing
			},
		});
	}

	resetPassword() {
		this.messageService.add({
			severity: 'info',
			summary: 'Reset Password',
			detail: 'Password reset functionality will be implemented soon.',
		});
	}
}
