import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AdminLayoutService } from '../service/admin-layout.service';
import { Router } from '@angular/router';

import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CommonModule } from '@angular/common';
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

@Component({
	selector: 'app-admin-topbar',
	templateUrl: './admin-topbar.component.html',
	styleUrls: ['./admin-topbar.component.css'],
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
	],
	providers: [ConfirmationService, MessageService],
})
export class AdminTopbarComponent {
	items!: MenuItem[];
	@ViewChild('menubutton') menuButton!: ElementRef;

	@ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

	@ViewChild('topbarmenu') menu!: ElementRef;

	profileSideBarVisible: boolean = false;

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
		private router: Router
	) {}

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
