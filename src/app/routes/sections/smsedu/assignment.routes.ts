import { Routes } from '@angular/router';

import { paths } from '../../paths';

export const assignmentRoutes: Routes = [
  {
    path: 'assignment',
    children: [
      {
        path: '',
        redirectTo: paths.smsedu.assignment.teacherLeader,
        pathMatch: 'full',
      },
      {
        path: 'teacher-leader',
        loadComponent: () =>
          import(
            '@pages/smsedu/assignments/assign-homeroom-teacher-page/assign-homeroom-teacher-page.component'
          ).then((m) => m.AssignHomeroomTeacherPageComponent),
      },
    ],
  },
];
