import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;
  showForgotModal = false;
  forgotEmail = '';
  forgotLoading = false;
  forgotMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      console.log('User already logged in, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loading) return;
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    console.log('Login attempt for:', this.email);
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        console.log('Login successful, user token received.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed in component:', err);
        this.error = err.error?.message || 'Connection to server failed. Please ensure the backend is running.';
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  openForgotModal() {
    this.showForgotModal = true;
    this.forgotEmail = '';
    this.forgotMessage = '';
  }

  closeForgotModal() {
    this.showForgotModal = false;
    this.forgotEmail = '';
    this.forgotMessage = '';
    this.forgotLoading = false;
  }

  submitForgotPassword() {
    if (this.forgotLoading) return;
    if (!this.forgotEmail) {
      this.forgotMessage = 'Please enter your email address';
      return;
    }
    this.forgotLoading = true;
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res) => {
        this.forgotMessage = 'Password reset link has been sent to your email. Check your email for instructions.';
        setTimeout(() => this.closeForgotModal(), 3000);
      },
      error: (err) => {
        this.forgotMessage = err.error?.message || 'An error occurred. Please try again.';
        this.forgotLoading = false;
      }
    });
  }
}
