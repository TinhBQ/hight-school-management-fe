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
      {
        path: 'subject',
        loadComponent: () =>
          import(
            '@pages/smsedu/assignments/assign-subject-page/assign-subject-page.component'
          ).then((m) => m.AssignSubjectPageComponent),
      },
      {
        path: 'teaching',
        loadComponent: () =>
          import(
            '@pages/smsedu/assignments/assign-teaching-page/assign-teaching-page.component'
          ).then((m) => m.AssignTeachingPageComponent),
      },
    ],
  },
];
