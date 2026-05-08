import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {

  private apiUrl =
    'https://localhost:7085/api/transfer';

  constructor(private http: HttpClient) { }

  transfer(data: any): Observable<any> {

    const token =
      localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(
      this.apiUrl,
      data,
      { headers }
    );
  }
}
