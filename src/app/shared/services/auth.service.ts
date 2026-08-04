import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { LoginRequest } from '../interfaces/login-request.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  private readonly emailSignal = signal<string | null>(this.storageService.get('auth_email'));

  readonly email = this.emailSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.emailSignal() !== null);

  login(request: LoginRequest): void {
    const token = btoa(`${request.email}:${request.password}`);

    this.storageService.set('auth_email', request.email);
    this.storageService.set('auth_token', token);
    this.storageService.set('auth_role', 'ADMIN');

    this.emailSignal.set(request.email);
  }

  logout(): void {
    this.storageService.remove('auth_email');
    this.storageService.remove('auth_token');
    this.storageService.remove('auth_role');

    this.emailSignal.set(null);

    void this.router.navigate(['/products']);
  }

  getToken(): string | null {
    return this.storageService.get('auth_token');
  }

  isAdmin(): boolean {
    return this.storageService.get('auth_role') === 'ADMIN';
  }
}
