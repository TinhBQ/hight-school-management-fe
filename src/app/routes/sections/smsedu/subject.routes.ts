import { Routes } from '@angular/router';

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
  },
];
