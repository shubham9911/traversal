import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'traversal_token';

  constructor(private http: HttpClient, private router: Router) {}

  sendOtp(phone: string) {
    return this.http.post(`${environment.apiUrl}/auth/send-otp`, { phone });
  }

  verifyOtp(phone: string, otp: string) {
    return this.http.post<{ token: string; userId: string }>(
      `${environment.apiUrl}/auth/verify-otp`,
      { phone, otp }
    ).pipe(
      tap(res => localStorage.setItem(this.TOKEN_KEY, res.token))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
