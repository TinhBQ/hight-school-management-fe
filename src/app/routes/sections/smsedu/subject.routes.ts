import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

import { paths } from '../../paths';

export const subjectRoutes: Routes = [
  {
    path: 'subject',
    children: [
      {
        path: '',
        redirectTo: paths.smsedu.subject.list,
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () =>
          import(
            '@pages/smsedu/subjects/subject-list-page/subject-list-page.component'
          ).then((m) => m.SubjectListPageComponent),
      },
    ],
    canActivate: [authGuard],
  },
];
