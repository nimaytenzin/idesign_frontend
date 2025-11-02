import { Injectable } from '@angular/core';
import {
	CanActivate,
	CanActivateChild,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
	constructor(private router: Router) {}

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
		const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

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
	constructor(private router: Router) {}

	canActivate(): boolean {
		const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
		const userRole = localStorage.getItem('userRole');

		if (!isAuthenticated) {
			this.router.navigate(['/auth/login']);
			return false;
		}

		if (userRole !== 'admin') {
			this.router.navigate(['/']);
			return false;
		}

		return true;
	}
}
