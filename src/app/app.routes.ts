import { Routes } from '@angular/router';

import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products',
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((module) => module.PRODUCT_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
