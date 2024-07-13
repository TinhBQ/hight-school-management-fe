import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

import { paths } from '../../paths';

export const timetableRoutes: Routes = [
  {
    path: 'timetable',
    children: [
      {
        path: '',
        redirectTo: paths.smsedu.timetable.list,
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () =>
          import(
            '@pages/smsedu/timetables/timetable-list-page/timetable-list-page.component'
          ).then((m) => m.TimetableListPageComponent),
      },
      {
        path: 'edit',
        loadComponent: () =>
          import(
            '@pages/smsedu/timetables/timetable-edit-page/timetable-edit-page.component'
          ).then((m) => m.TimetableEditPageComponent),
      },
      {
        path: 'view',
        loadComponent: () =>
          import(
            '@pages/smsedu/timetables/timetable-view-page/timetable-view-page.component'
          ).then((m) => m.TimetableViewPageComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            '@pages/smsedu/timetables/timetable-create-page/timetable-create-page.component'
          ).then((m) => m.TimetableCreatePageComponent),
      },
    ],
    canActivate: [authGuard],
  },
];
