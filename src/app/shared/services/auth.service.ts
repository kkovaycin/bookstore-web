import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { RegisterRequest } from '../interfaces/register-request.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  private readonly apiUrl = 'http://localhost:8081/api/auth';

  private readonly userSignal = signal<AuthenticatedUser | null>(this.getStoredUser());

  readonly user = this.userSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.userSignal() !== null && this.getToken() !== null);

  readonly username = computed(() => this.userSignal()?.username ?? null);

  readonly isAdmin = computed(() => this.userSignal()?.role === 'ADMIN');

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.storageService.set('auth_token', response.token);

        this.storageService.set('auth_user', JSON.stringify(response.user));

        this.userSignal.set(response.user);
      }),
    );
  }

  register(request: RegisterRequest): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    this.storageService.remove('auth_token');
    this.storageService.remove('auth_user');

    this.userSignal.set(null);

    void this.router.navigate(['/products']);
  }

  getToken(): string | null {
    return this.storageService.get('auth_token');
  }

  private getStoredUser(): AuthenticatedUser | null {
    const storedUser = this.storageService.get('auth_user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthenticatedUser;
    } catch {
      this.storageService.remove('auth_user');
      return null;
    }
  }
}
