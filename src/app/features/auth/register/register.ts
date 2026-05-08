import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: false
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  errorMessage: string = '';
  successMessage: string = '';

  // ✅ today date for max DOB restriction
  todayDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      username: ['', Validators.required],

      // ✅ password policy (FR-REG-02)
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$')
        ]
      ]
    });
  }

  onSubmit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.valid) {

      const formValue = this.registerForm.value;

      const dob = new Date(formValue.dateOfBirth);
      const today = new Date();

      // normalize time
      today.setHours(0, 0, 0, 0);
      dob.setHours(0, 0, 0, 0);

      // ❌ invalid date
      if (!formValue.dateOfBirth || isNaN(dob.getTime())) {
        this.errorMessage = 'Invalid Date of Birth';
        return;
      }

      // ❌ SQL min date
      if (dob.getFullYear() < 1753) {
        this.errorMessage = 'Date must be after 1753';
        return;
      }

      // ❌ future date block
      if (dob > today) {
        this.errorMessage = 'Date of Birth cannot be in the future';
        return;
      }

      const payload = {
        fullName: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        address: formValue.address,
        username: formValue.username,
        password: formValue.password,
        dob: new Date(formValue.dateOfBirth).toISOString()
      };

      this.authService.register(payload).subscribe({

        next: (res: any) => {

          // ❌ backend validation fail (duplicate user etc.)
          if (!res.success) {
            this.errorMessage = res.message || 'Registration failed';
            return;
          }

          // ✅ success message (FR-REG-04)
          this.successMessage = res.message || 'Registration successful';

          // redirect with message
          setTimeout(() => {
            this.router.navigate(['/login'], {
              state: { message: this.successMessage }
            });
          }, 1500);
        },

        error: (err: any) => {

          let msg = 'Registration failed';

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
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
    }
  }
}
