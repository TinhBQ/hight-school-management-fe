import { Routes } from '@angular/router';

import { paths } from '../../paths';

export const teacherRoutes: Routes = [
  {
    path: 'teacher',
    children: [
      {
        path: '',
        redirectTo: paths.smsedu.teacher.list,
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () =>
          import(
            '@pages/smsedu/teachers/teacher-list-page/teacher-list-page.component'
          ).then((m) => m.TeacherListPageComponent),
      },
    ],
  },
];