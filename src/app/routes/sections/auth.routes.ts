import { Routes } from '@angular/router';

import { paths } from '../paths';

export const authRoutes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: paths.auth.login,
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('@pages/auth/login-page/login-page.component').then(
            (m) => m.LoginPageComponent
          ),
      },
    ],
  },
];
