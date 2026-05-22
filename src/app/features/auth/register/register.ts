import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  startsWithNumber(value: string): boolean {

    if (!value) {
      return false;
    }

    return /^[0-9]/.test(value);
  }
  startsWithLetter(value: string): boolean {

    if (!value) {
      return true;
    }

    return /^[A-Za-z]/.test(value);
  }

  containsValidUsernameChars(value: string): boolean {

    if (!value) {
      return true;
    }

    return /^[A-Za-z0-9_]+$/.test(value);
  }

  registerForm!: FormGroup;
  showPassword: boolean = false;

  errorMessage: string = '';
  successMessage: string = '';

  // today's date for DOB max restriction
  todayDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.registerForm = this.fb.group({

      // FULL NAME
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z ]+$/)
        ]
      ],

      // EMAIL
      // EMAIL
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
          )
        ]
      ],


      // PHONE NUMBER
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?!0{10}$)[6-9][0-9]{9}$/)
        ]
      ],

      // DATE OF BIRTH
      dateOfBirth: [
        '',
        [
          Validators.required,
          this.ageValidator
        ]
      ],

      // ADDRESS
      address: [
        '',
        [
          Validators.required,
          Validators.maxLength(1500)
        ]
      ],

      // USERNAME
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
          Validators.pattern(/^[A-Za-z]/),

         
          Validators.pattern(/^[A-Za-z0-9_]+$/) ]
      ],

      // PASSWORD
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/
          )
        ]
      ]
    });
  }

  // CUSTOM VALIDATOR FOR 18+ AGE
  ageValidator(control: AbstractControl): ValidationErrors | null {

    if (!control.value) {
      return null;
    }


    const dob = new Date(control.value);

    // invalid date
    if (isNaN(dob.getTime())) {
      return { invalidDate: true };
    }

    // SQL minimum supported year
    if (dob.getFullYear() < 1753) {
      return { invalidYear: true };
    }

    const today = new Date();

    // future date check
    if (dob > today) {
      return { futureDate: true };
    }

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference =
      today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < dob.getDate()
      )
    ) {
      age--;
    }

    // under 18 validation
    if (age < 18) {
      return { underAge: true };
    }

    return null;
  }

  onSubmit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    // FORM INVALID
    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      this.errorMessage =
        'Please correct the highlighted fields';

      return;
    }

    const formValue = this.registerForm.value;

    const payload = {

      fullName: formValue.fullName.trim(),

      email: formValue.email.trim().toLowerCase(),

      phone: formValue.phone.trim(),

      address: formValue.address.trim(),

      username: formValue.username.trim(),

      password: formValue.password,

      dob: new Date(formValue.dateOfBirth).toISOString()
    };

    console.log('FINAL PAYLOAD:', payload);

    this.authService.register(payload).subscribe({

      next: (res: any) => {

        // backend validation fail
        if (!res.success) {

          this.errorMessage =
            res.message || 'Registration failed';

          return;
        }

        // SUCCESS
        this.successMessage =
          res.message || 'Registration successful';

        // reset form
        this.registerForm.reset();

        // redirect to login
        setTimeout(() => {

          this.router.navigate(['/login'], {
            state: {
              message: this.successMessage
            }
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
  }

  // GETTERS

  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get dateOfBirth() {
    return this.registerForm.get('dateOfBirth');
  }

  get address() {
    return this.registerForm.get('address');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }
}
