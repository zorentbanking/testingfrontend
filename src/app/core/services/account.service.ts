import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = 'https://localhost:7085/api/accounts';

  constructor(private http: HttpClient) { }

  getMyAccounts(): Observable<any> {

    const token = localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/my`, { headers });
  }
  createAccount(data: any): Observable<any> {

    const token = localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrl}/create`,
      data,
      { headers }
    );
  }
}

