import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((module) => module.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((module) => module.Register),
  },
];
