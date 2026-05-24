import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

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

  successMessage = '';
  errorMessage = '';
  showPassword: boolean = false;
  tokenInvalid: boolean = false;

  token = '';

  apiUrl = 'https://localhost:7085/api/auth/reset-password';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    // GET TOKEN FROM URL
    this.route.queryParams.subscribe(params => {

      this.token = params['token'];

      // TOKEN MISSING
      if (!this.token) {

        this.tokenInvalid = true;

        this.errorMessage =
          'Reset link has expired or already been used';

        return;
      }

      // VALIDATE TOKEN
      this.authService
        .validateResetToken(this.token)
        .subscribe({

          next: () => {

            // TOKEN VALID
          },

          error: (err: any) => {

            this.tokenInvalid = true;

            this.errorMessage =
              err.error?.message ||
              'Reset link has expired or already been used';
          }
        });

    });
  }

  isPasswordValid(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return passwordRegex.test(password);
  }

  onChangePassword(): void {


    if (!this.isPasswordValid(this.newPassword)) {

      this.errorMessage =
        'Password does not meet security requirements';

      this.successMessage = '';

      return;
    }

    if (this.newPassword !== this.confirmPassword) {

      this.errorMessage = 'Passwords do not match';

      this.successMessage = '';

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

        this.successMessage =
          response.message || 'Password reset successful';

        this.errorMessage = '';

        this.newPassword = '';

        this.confirmPassword = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

        // Redirect login

      },

      error: (error) => {

        console.log(error);

        this.errorMessage =
          error.error?.message || 'Password reset failed';

        this.successMessage = '';
      }

    });
  }
}
