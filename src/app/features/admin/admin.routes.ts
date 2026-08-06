import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'products/new',
    pathMatch: 'full',
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./pages/product-form/product-form').then(
        (module) => module.ProductForm,
      ),
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./pages/product-form/product-form').then(
        (module) => module.ProductForm,
      ),
  },
];
