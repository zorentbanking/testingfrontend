import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent {

  newPassword = '';
  confirmPassword = '';

  token = '';

  apiUrl = 'https://localhost:7085/api/auth/reset-password';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    // Get token from URL
    this.route.queryParams.subscribe(params => {

      this.token = params['token'];

      if (!this.token) {
        alert('Invalid or missing token');
        this.router.navigate(['/login']);
      }

    });
  }

  onChangePassword(): void {

    // Password match validation
    if (this.newPassword !== this.confirmPassword) {

      alert('Passwords do not match');

      return;
    }

    // API body
    const body = {
      token: this.token,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    // Call backend
    this.http.post<any>(this.apiUrl, body).subscribe({

      next: (response) => {

        alert(response.message || 'Password reset successful');

        // Redirect login
        this.router.navigate(['/login']);
      },

      error: (error) => {

        console.log(error);

        alert(
          error.error?.message ||
          'Password reset failed'
        );
      }

    });
  }
}
