import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AccountService {

  private apiUrl =
    'https://localhost:7085/api/accounts';

  private authUrl =
    'https://localhost:7085/api/auth';

  constructor(
    private http: HttpClient
  ) { }

  // AUTH HEADERS
  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('accessToken');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // GET MY ACCOUNTS
  getMyAccounts(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/my`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // CREATE ACCOUNT
  createAccount(data: any): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/create`,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  // VALIDATE ACCOUNT NUMBER
  validateAccount(
    accountNumber: string
  ): Observable<any> {

    return this.http.get(
      `${this.authUrl}/validate-account/${accountNumber}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}
