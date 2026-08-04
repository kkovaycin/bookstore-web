import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((module) => module.ProductList),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((module) => module.ProductDetail),
  },
];
