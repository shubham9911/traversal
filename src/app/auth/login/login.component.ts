/**
 * Login Component for Traversal Application
 * 
 * Handles user authentication including both login and registration functionality.
 * Provides a secure interface for users to access the Traversal map application.
 * 
 * Features:
 * - User login with email and password
 * - New user registration
 * - Form validation and error handling
 * - Automatic navigation to dashboard upon success
 * - Password visibility toggle for better UX
 * 
 * Security considerations:
 * - Passwords are hashed on the server side
 * - Form data is validated before submission
 * - Secure HTTP communication with backend API
 */

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  
  /** Controls password visibility toggle (show/hide password) */
  hide = true;
  
  /**
   * Login/Registration Form
   * 
   * Reactive form for capturing user credentials.
   * Used for both login and registration workflows.
   */
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(6)
    ]),
  });

  /**
   * Constructor - Initialize authentication component
   * 
   * @param router - Angular router for navigation after successful auth
   * @param httpclient - HTTP client for API communication
   */
  constructor(private router: Router, private httpclient: HttpClient) {
    console.log('🔐 Login component initialized');
  }

  /**
   * User Login Handler
   * 
   * Authenticates existing user credentials against the backend API.
   * Redirects to dashboard upon successful authentication.
   */
  login(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('🔐 Attempting user login for:', credentials.email);
      
      this.httpclient
        .put('http://localhost:3000/api/login', credentials)
        .subscribe({
          next: (res: any) => {
            console.log('✅ Login response:', res);
            
            if (res.success) {
              console.log('🎉 Login successful, navigating to dashboard');
              this.router.navigate(['dashboard']);
            } else {
              console.warn('⚠️ Login failed:', res.message);
              alert(res.message || 'Login failed. Please check your credentials.');
            }
          },
          error: (error) => {
            console.error('❌ Login error:', error);
            alert('Login failed. Please check your internet connection and try again.');
          }
        });
    } else {
      console.warn('⚠️ Login form is invalid');
      this.markFormGroupTouched();
    }
  }

  /**
   * User Registration Handler
   * 
   * Creates a new user account with the provided credentials.
   * Automatically logs in the user and redirects to dashboard upon success.
   */
  signup(): void {
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;
      console.log('📝 Attempting user registration for:', userData.email);
      
      this.httpclient
        .post('http://localhost:3000/api/signup', userData)
        .subscribe({
          next: (res: any) => {
            console.log('✅ Registration response:', res);
            
            if (res.success) {
              console.log('🎉 Registration successful, navigating to dashboard');
              this.router.navigate(['dashboard']);
            }
            
            // Show response message to user
            alert(res.message);
          },
          error: (error) => {
            console.error('❌ Registration error:', error);
            alert('Registration failed. Please try again later.');
          }
        });
    } else {
      console.warn('⚠️ Registration form is invalid');
      this.markFormGroupTouched();
    }
  }

  /**
   * Form Validation Helper
   * 
   * Marks all form fields as touched to trigger validation display.
   * Helps users see validation errors when they attempt to submit invalid forms.
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
