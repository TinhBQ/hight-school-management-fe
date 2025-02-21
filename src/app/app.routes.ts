import { Routes } from '@angular/router';

import { paths } from './routes/paths';
import { authRoutes } from './routes/sections/auth.routes';
import { errorRoutes } from './routes/sections/error.routes';
import { smseduRoutes } from './routes/sections/smsedu/smsedu.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: paths.auth.login,
    pathMatch: 'full',
  },
  ...smseduRoutes,
  ...authRoutes,
  ...errorRoutes,
  { path: '**', redirectTo: paths.error.notFound, pathMatch: 'full' },
];
