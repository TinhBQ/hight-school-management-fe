import { Observable } from 'rxjs';

import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
// eslint-disable-next-line prettier/prettier
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpInterceptor,
} from '@angular/common/http';

// import { AuthService } from '@core/services/auth.service';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {
  constructor(
    // private authService: AuthService,
    private router: Router

    // eslint-disable-next-line prettier/prettier
    ) {}

  // eslint-disable-next-line prettier/prettier
    intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // if (this.authService.isLoggedIn()) {
    //   request = request.clone({
    //     headers: request.headers.set(
    //       'Authorization',
    //       'Bearer ' + this.authService.getToken()
    //     ),
    //   });
    // }
    return next.handle(request);
  }
}
