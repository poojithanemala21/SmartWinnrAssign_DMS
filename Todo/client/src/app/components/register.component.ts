import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  username = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loading) return;
    if (!this.username || !this.email || !this.password) {
      this.error = 'All fields are required';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    console.log('Registering user:', this.username, this.email);
    this.loading = true;
    this.error = '';
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        console.log('Registration success, navigating to login');
        this.router.navigate(['/login'], { queryParams: { registered: true } });
      },
      error: (err) => {
        console.error('Registration failed in component:', err);
        this.error = err.error?.message || 'Server connection failed';
        this.loading = false;
      }
    });
  }
}
