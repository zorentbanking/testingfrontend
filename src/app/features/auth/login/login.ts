import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    // ✅ show message from register page
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['message']) {
      this.successMessage = navigation.extras.state['message'];
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {

    this.successMessage = '';
    this.errorMessage = '';

    if (this.loginForm.valid) {

      this.authService.login(this.loginForm.value).subscribe({

        next: (res: any) => {

          // ✅ handle backend failure
          if (!res.success) {
            this.errorMessage = res.message || 'Login failed';
            return;
          }
          this.authService.setLoginStatus(true);

          // ✅ store tokens (FR-AUTH-02)
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          localStorage.setItem('user', JSON.stringify({

            username: this.loginForm.value.username,

            email: res.data.email || ''

          }));
          // ✅ navigate
          this.router.navigate(['/dashboard']);
        },

        error: (err: any) => {

          let msg = 'Login failed';

          if (err.error?.message) {
            msg = err.error.message;
          }
          else if (typeof err.error === 'string') {
            try {
              const parsed = JSON.parse(err.error);
              msg = parsed.message || msg;
            } catch {
              msg = err.error;
            }
          }

          this.errorMessage = msg;
        }
      });

    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please enter username and password';
    }
  }
}
