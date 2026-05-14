import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl =
    'https://localhost:7085/api/profile';

  constructor(
    private http: HttpClient
  ) { }

  private getHeaders() {

    return {
      headers: new HttpHeaders({
        Authorization:
          `Bearer ${localStorage.getItem('accessToken')}`
      })
    };
  }

  // GET PROFILE
  getProfile(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}`,
      this.getHeaders()
    );
  }

  // UPDATE PROFILE
  updateProfile(
    payload: any
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/update`,
      payload,
      this.getHeaders()
    );
  }

  // CHANGE PASSWORD
  changePassword(
    payload: any
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/change-password`,
      payload,
      this.getHeaders()
    );
  }
}
