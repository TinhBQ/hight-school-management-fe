import { LayoutMainComponent } from '@layouts/main/layout-main.component';

import { Routes } from '@angular/router';

import { paths } from '../../paths';
import { classRoutes } from './class.routes';
import { teacherRoutes } from './teacher.routes';
import { subjectRoutes } from './subject.routes';
import { timetableRoutes } from './timetable.routes';
import { assignmentRoutes } from './assignment.routes';

export const smseduRoutes: Routes = [
  {
    path: 'smsedu',
    component: LayoutMainComponent,
    children: [
      {
        path: '',
        redirectTo: paths.smsedu.class.list,
        pathMatch: 'full',
      },
      ...classRoutes,
      ...subjectRoutes,
      ...teacherRoutes,
      ...assignmentRoutes,
      ...timetableRoutes,
    ],
  },
];
