/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';
import { catchError, Observable, throwError } from 'rxjs';

import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
// eslint-disable-next-line prettier/prettier
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';

import { paths } from 'src/app/routes/paths';

import { apiPublic } from '@core/utils';

// import { AuthService } from '@core/services/auth.service';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  // eslint-disable-next-line prettier/prettier
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    console.log('request.url', request.url);
    if (apiPublic.includes(request.url)) {
      return next.handle(request);
    }

    const accessToken = localStorage.getItem('accessToken');

    console.log('accessToken', accessToken);

    if (!accessToken || this.isTokenExpired(accessToken)) {
      this.router.navigate([paths.error.forbidden]);
      return throwError('...');
    }

    return this.handleAuthorizedRequest(request, next);
  }

  private handleAuthorizedRequest(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        })
      )
      .pipe(catchError((err) => this.handleAuthError(err)));
  }

  private isTokenExpired(token: string): boolean {
    const decodedToken = jwtDecode(token);
    return decodedToken.exp && decodedToken.exp < Date.now() / 1000;
  }

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    if (err && (err.status === 500 || err.status === 404)) {
      this.router.navigate([paths.error.notFound]);
    }
    return throwError('...');
  }
}
