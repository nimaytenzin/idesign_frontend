import { Injectable } from '@angular/core';
import {
	CanActivate,
	CanActivateChild,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../dataservice/auth/auth.service';
import { UserRole } from '../constants/enums';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
	constructor(
		private router: Router,
		private authService: AuthService
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		return this.checkAuth(state);
	}

	canActivateChild(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		return this.checkAuth(state);
	}

	private checkAuth(state: RouterStateSnapshot): boolean {
		const isAuthenticated = this.authService.isAuthenticated();

		if (!isAuthenticated) {
			this.router.navigate(['/auth/login'], {
				queryParams: { returnUrl: state.url },
			});
			return false;
		}

		return true;
	}
}

@Injectable({
	providedIn: 'root',
})
export class AdminGuard implements CanActivate {
	constructor(
		private router: Router,
		private authService: AuthService
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		if (!this.authService.isAuthenticated()) {
			this.router.navigate(['/auth/login'], {
				queryParams: { returnUrl: state.url },
			});
			return false;
		}

		if (!this.authService.isAdmin()) {
			this.router.navigate(['/']);
			return false;
		}

		return true;
	}
}

@Injectable({
	providedIn: 'root',
})
export class StaffGuard implements CanActivate {
	constructor(
		private router: Router,
		private authService: AuthService
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		if (!this.authService.isAuthenticated()) {
			this.router.navigate(['/auth/login'], {
				queryParams: { returnUrl: state.url },
			});
			return false;
		}

		const hasStaffRole = this.authService.hasAnyRole([
			UserRole.STAFF,
		]);

		if (!hasStaffRole) {
			this.router.navigate(['/']);
			return false;
		}

		return true;
	}
}
