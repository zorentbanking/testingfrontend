import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://localhost:7085/api/auth';

  isAuthenticated = false;

  constructor(private http: HttpClient) { }

  setLoginStatus(status: boolean): void {
    this.isAuthenticated = status;
  }
  validateResetToken(token: string) {

    return this.http.get(
      `${this.apiUrl}/validate-reset-token?token=${token}`
    );
  }

  getLoginStatus(): boolean {
    return this.isAuthenticated;
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.apiUrl}/refresh`, token);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
}
