import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IAuth } from '../interfaces/i-auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endpoint: string = environment.apiURL + '/auth';

  constructor(private http: HttpClient) {}

  onLogin(auth: IAuth): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.endpoint + '/login', auth);
  }
}
