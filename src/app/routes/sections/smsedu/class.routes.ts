import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

import { paths } from '../../paths';

export const classRoutes: Routes = [
  {
    path: 'class',
    children: [
      {
        path: '',
        redirectTo: paths.smsedu.class.list,
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () =>
          import(
            '@pages/smsedu/classes/class-list-page/class-list-page.component'
          ).then((m) => m.ClassListPageComponent),
      },
    ],
    canActivate: [authGuard],
  },
];
