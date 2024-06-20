import { Routes } from '@angular/router';

export const errorRoutes: Routes = [
  {
    path: 'error',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@pages/errors/error-page/error-page.component').then(
            (m) => m.ErrorPageComponent
          ),
      },
      {
        path: '404',
        loadComponent: () =>
          import('@pages/errors/not-found-page/not-found-page.component').then(
            (m) => m.NotFoundPageComponent
          ),
      },
      {
        path: '401',
        loadComponent: () =>
          import(
            '@pages/errors/access-denied-page/access-denied-page.component'
          ).then((m) => m.AccessDeniedPageComponent),
      },
    ],
  },
];
