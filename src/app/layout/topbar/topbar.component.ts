import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { LayoutService } from '../service/layout.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/dataservice/auth/auth.service';
import { UserRole } from '../../core/constants/enums';

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
import { MenuModule } from 'primeng/menu';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { User } from '../../core/dataservice/user/user.interface';
import { environment } from '../../../environments/environment';

@Component({
	selector: 'app-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
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
		MenuModule,
	],
	providers: [ConfirmationService, MessageService, DatePipe],
})
export class TopbarComponent implements OnInit, OnDestroy {
	items!: MenuItem[];
	profileMenuItems: MenuItem[] = [];
	@ViewChild('menubutton') menuButton!: ElementRef;

	@ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

	@ViewChild('topbarmenu') menu!: ElementRef;
	@ViewChild('profileMenu') profileMenu!: any;

	get profileSideBarVisible(): boolean {
		return this.layoutService.state.profileSidebarVisible;
	}

	set profileSideBarVisible(value: boolean) {
		this.layoutService.state.profileSidebarVisible = value;
	}

	currentDate: Date = new Date();
	currentTime: string = '';
	private timeInterval: any;
	private destroy$ = new Subject<void>();

	currentUser: User | null = null;

	

	constructor(
		public layoutService: LayoutService,
		private confirmationService: ConfirmationService,
		private messageService: MessageService,
		private router: Router,
		private datePipe: DatePipe,
		private authService: AuthService
	) {}

	ngOnInit(): void {
		this.updateTime();
		// Update time every second
		this.timeInterval = setInterval(() => {
			this.currentDate = new Date();
			this.updateTime();
		}, 1000);

		// Subscribe to auth state changes to get current user
		this.authService.authState$
			.pipe(takeUntil(this.destroy$))
			.subscribe((authState) => {
				this.currentUser = authState.user;
				this.buildProfileMenu();
			});

		// Get initial user if available
		this.currentUser = this.authService.getCurrentUser();
		this.buildProfileMenu();
	}

	buildProfileMenu() {
		this.profileMenuItems = [
			{
				label: this.currentUser?.name || '',
				disabled: true,
				styleClass: 'font-semibold text-gray-900 text-sm py-2',
			},
		
		
			{
				separator: true,
			},
			{
				label: 'Sign Out',
				icon: 'pi pi-sign-out',
				command: () => {
					this.logout();
				},
				styleClass: 'text-red-600',
			},
		];
	}

	toggleProfileMenu(event: Event) {
		if (this.profileMenu) {
			this.profileMenu.toggle(event);
		}
	}

	ngOnDestroy(): void {
		if (this.timeInterval) {
			clearInterval(this.timeInterval);
		}
		this.destroy$.next();
		this.destroy$.complete();
	}

	private updateTime(): void {
		this.currentTime = this.datePipe.transform(this.currentDate, 'hh:mm:ss a') || '';
	}

	/**
	 * Format role name for display
	 */
	private formatRoleName(role: UserRole): string {
		switch (role) {
			case UserRole.ADMIN:
				return 'Administrator';
			case UserRole.STAFF:
				return 'Staff';
			case UserRole.AFFILIATE_MARKETER:
				return 'Affiliate Marketer';
			default:
				return role;
		}
	}

	logout(event?: Event) {
		this.confirmationService.confirm({
			target: event?.target as EventTarget,
			message: 'Are you sure you want to sign out?',
			header: 'Confirm Sign Out',
			icon: 'pi pi-sign-out',
			acceptIcon: 'none',
			rejectIcon: 'none',
			rejectButtonStyleClass: 'p-button-text',
			accept: () => {
				this.authService.logout().subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'You have been signed out successfully',
						});
					},
					error: () => {
						// Even if API call fails, logout should still work
						this.messageService.add({
							severity: 'info',
							summary: 'Signed Out',
							detail: 'You have been signed out',
						});
					},
				});
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

	parseImageUrl(profileImageUrl: string): string {
		return `${environment.BASEAPI_URL}${profileImageUrl}`;
	}
}
