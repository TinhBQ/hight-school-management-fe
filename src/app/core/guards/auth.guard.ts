import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { MessageService } from 'primeng/api';

import { paths } from 'src/app/routes/paths';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authGuard: CanActivateFn = (route, state) => {
  const accessToken = localStorage.getItem('accessToken');

  const router = inject(Router);
  if (!accessToken) {
    router.navigate([paths.auth.login]);
    inject(MessageService).add({
      severity: 'error',
      summary: 'Thất bại',
      detail:
        'Phiên đăng nhập của bạn hết hạn hoặc không thành công. Vui lòng đăng nhập lại.',
    });
    return false;
  }

  return true;
};
