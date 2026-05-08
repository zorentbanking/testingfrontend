import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],

  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})

export class ForgotPasswordComponent {

  forgotPasswordForm: FormGroup;

  loading = false;

  apiUrl =
    'https://localhost:7085/api/auth/forgot-password';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {

    this.forgotPasswordForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]

    });
  }

  onSubmit(): void {

    if (this.forgotPasswordForm.invalid) {

      this.forgotPasswordForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    const body = {
      email: this.forgotPasswordForm.value.email
    };

    this.http.post<any>(this.apiUrl, body).subscribe({

      next: (response) => {

        this.loading = false;

        alert(
          response.message ||
          'Reset link sent to your email'
        );

        this.forgotPasswordForm.reset();
      },

      error: (error) => {

        this.loading = false;

        console.log(error);

        alert(
          error.error?.message ||
          'Something went wrong'
        );
      }

    });
  }
}
