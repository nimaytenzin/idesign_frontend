import { Component, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators,
	ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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

	constructor(private fb: FormBuilder, private router: Router) {}

	ngOnInit(): void {
		this.loginForm = this.fb.group({
			username: ['admin', [Validators.required]],
			password: ['admin123', [Validators.required, Validators.minLength(3)]],
		});
	}

	login(): void {
		if (this.loginForm.invalid) {
			this.markFormGroupTouched();
			return;
		}

		this.isLoading = true;
		this.errorMessage = '';

		const { username, password } = this.loginForm.value;

		// Simple dummy authentication
		setTimeout(() => {
			if (username === 'admin' && password === 'admin123') {
				// Store simple auth state in localStorage
				localStorage.setItem('isAuthenticated', 'true');
				localStorage.setItem('userRole', 'admin');

				// Redirect to admin dashboard
				this.router.navigate(['/admin']);
			} else {
				this.errorMessage =
					'Invalid username or password. Please try: admin/admin123';
			}
			this.isLoading = false;
		}, 1000); // Simulate API delay
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
					fieldName === 'username' ? 'Username' : 'Password'
				} is required`;
			}
			if (field.errors['minlength']) {
				return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
			}
		}

		return '';
	}
}
