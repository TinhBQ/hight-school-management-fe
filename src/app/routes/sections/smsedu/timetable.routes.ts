import { Routes } from '@angular/router';

import { paths } from '../../paths';

export const timetableRoutes: Routes = [
  {
    path: 'timetable',
    children: [
      {
        path: '',
        redirectTo: paths.smsedu.timetable.edit,
        pathMatch: 'full',
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
    ],
  },
];
