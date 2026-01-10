import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../../core/dataservice/company/company.service';
import { Company } from '../../../core/dataservice/company/company.interface';
import { AuthService } from '../../../core/dataservice/auth/auth.service';
import { LoginDto } from '../../../core/dataservice/auth/auth.interface';
import { UserRole } from '../../../core/constants/enums';

@Component({
	selector: 'app-login',
	standalone: true,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginComponent implements OnInit {
	loginForm!: FormGroup;
	isLoading = false;
	errorMessage = '';
	company: Company | null = null;
	logoUrl: string = 'logo.png'; // Fallback logo

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private companyService: CompanyService,
		private cdr: ChangeDetectorRef,
		private authService: AuthService
	) {}

	ngOnInit(): void {
		// Check if user is already authenticated
		if (this.authService.isAuthenticated()) {
			this.redirectBasedOnRole();
			return;
		}

		this.loginForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(3)]],
		});
		
		// Load company logo
		this.loadCompanyLogo();
	}

	loadCompanyLogo(): void {
		this.companyService.getCompany().subscribe({
			next: (data) => {
				if (data) {
					this.company = data;
					if (data.logo) {
						// Use the logo endpoint
						this.logoUrl = this.companyService.getLogoUrl();
					} else {
						// Use fallback logo
						this.logoUrl = '/assets/logo.png';
					}
				} else {
					// Use fallback logo
					this.logoUrl = '/assets/logo.png';
				}
				this.cdr.markForCheck();
			},
			error: () => {
				// If company doesn't exist, use fallback logo
				this.logoUrl = '/assets/logo.png';
				this.cdr.markForCheck();
			},
		});
	}

	login(): void {
		if (this.loginForm.invalid) {
			this.markFormGroupTouched();
			return;
		}

		this.isLoading = true;
		this.errorMessage = '';

		const { email, password } = this.loginForm.value;

		const loginDto: LoginDto = {
			email: email.trim(),
			password: password,
		};

		this.authService.login(loginDto).subscribe({
			next: (response) => {
				if (response.token && response.user) {
 					 

 					this.redirectBasedOnRole();
				} else {
					this.errorMessage = 'Invalid response from server. Please try again.';
					this.isLoading = false;
				}
			},
			error: (error) => {
				console.error('Login error:', error);
				if (error.statusCode === 401) {
					this.errorMessage = error.message || 'Invalid email or password. Please try again.';
				} else if (error.message) {
					this.errorMessage = error.message;
				} else {
					this.errorMessage = 'An error occurred during login. Please try again.';
				}
				this.isLoading = false;
			},
		});
	}

	/**
	 * Redirect user based on their role
	 */
	private redirectBasedOnRole(): void {
		const user = this.authService.getCurrentUser();
		
		if (!user) {
			this.errorMessage = 'Unable to retrieve user information.';
			this.isLoading = false;
			return;
		}

		switch (user.role) {
			case UserRole.ADMIN:
				this.router.navigate(['/admin']);
				break;
 			case UserRole.STAFF:
				this.router.navigate(['/staff']);
				break;
 			case UserRole.AFFILIATE_MARKETER:
				this.router.navigate(['/affiliate-marketer']);
				break;
		}
	}

	/**
	 * Mark all form controls as touched to show validation errors
	 */
	private markFormGroupTouched(): void {
		Object.keys(this.loginForm.controls).forEach((key) => {
			const control = this.loginForm.get(key);
			control?.markAsTouched();
		});
	}

	/**
	 * Check if form field has error
	 */
	hasFieldError(fieldName: string): boolean {
		const field = this.loginForm.get(fieldName);
		return !!(field && field.invalid && field.touched);
	}

	/**
	 * Get field error message
	 */
	getFieldError(fieldName: string): string {
		const field = this.loginForm.get(fieldName);

		if (field && field.errors && field.touched) {
			if (field.errors['required']) {
				return `${
					fieldName === 'email' ? 'Email' : 'Password'
				} is required`;
			}
			if (field.errors['email']) {
				return 'Please enter a valid email address';
			}
			if (field.errors['minlength']) {
				return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
			}
		}

		return '';
	}
}
