import { LayoutMainComponent } from '@layouts/main/layout-main.component';

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/smsedu/classes',
    pathMatch: 'full',
    // loadComponent: () =>
    //   import(
    //     '@features/subject-class/components/subjects-for-class/subjects-for-class.component'
    //   ).then((m) => m.SubjectsForClassComponent),
  },
  {
    path: 'smsedu',
    component: LayoutMainComponent,
    children: [
      {
        path: 'classes',
        children: [
          {
            path: '',
            redirectTo: '/smsedu/classes/list',
            pathMatch: 'full',
          },
          {
            path: 'list',
            loadComponent: () =>
              import(
                '@features/classes/components/class-list/class-list.component'
              ).then((m) => m.ClassListComponent),
          },
        ],
      },
      {
        path: 'subjects',
        children: [
          {
            path: '',
            redirectTo: '/smsedu/subjects/list',
            pathMatch: 'full',
          },
          {
            path: 'list',
            loadComponent: () =>
              import(
                '@features/subjects/components/subject-list/subject-list.component'
              ).then((m) => m.SubjectListComponent),
          },
        ],
      },
    ],
  },
];
