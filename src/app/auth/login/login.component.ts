import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  step: 'phone' | 'otp' = 'phone';
  loading = false;
  error = '';

  phoneCtrl = new FormControl('', [Validators.required, Validators.pattern(/^\+?[1-9]\d{9,14}$/)]);
  otpCtrl = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]);

  constructor(private auth: AuthService, private router: Router) {}

  sendOtp() {
    if (this.phoneCtrl.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.sendOtp(this.phoneCtrl.value!).subscribe({
      next: () => { this.step = 'otp'; this.loading = false; },
      error: () => { this.error = 'Failed to send OTP. Try again.'; this.loading = false; },
    });
  }

  verifyOtp() {
    if (this.otpCtrl.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.verifyOtp(this.phoneCtrl.value!, this.otpCtrl.value!).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: () => { this.error = 'Invalid or expired OTP.'; this.loading = false; },
    });
  }

  back() {
    this.step = 'phone';
    this.otpCtrl.reset();
    this.error = '';
  }
}
