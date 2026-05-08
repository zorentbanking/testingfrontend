import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.css'],
  standalone: false
})
export class CreateAccountComponent implements OnInit {

  accountForm!: FormGroup;

  minDeposit: number = 0;

  loading: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {

    this.accountForm = this.fb.group({
      accountType: ['', Validators.required],

      initialDeposit: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });

    this.accountForm
      .get('accountType')
      ?.valueChanges.subscribe(type => {

        this.updateMinDeposit(type);
      });
  }

  updateMinDeposit(type: string): void {

    switch (type) {

      case 'Savings':
        this.minDeposit = 500;
        break;

      case 'Checking':
        this.minDeposit = 100;
        break;

      case 'Fixed Deposit':
        this.minDeposit = 1000;
        break;

      case 'Recurring Deposit':
        this.minDeposit = 100;
        break;

      default:
        this.minDeposit = 0;
    }

    this.accountForm.get('initialDeposit')?.setValidators([
      Validators.required,
      Validators.min(this.minDeposit)
    ]);

    this.accountForm
      .get('initialDeposit')
      ?.updateValueAndValidity();
  }

  onSubmit(): void {

    if (this.accountForm.invalid) {

      this.accountForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.successMessage = '';
    this.errorMessage = '';

    const payload = {

      type: this.accountForm.value.accountType,

      initialDeposit:
        Number(this.accountForm.value.initialDeposit)
    };

    this.accountService.createAccount(payload).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (!res.success) {

          this.errorMessage =
            res.message || 'Account creation failed';

          return;
        }

        this.successMessage =
          res.message || 'Account created successfully';

        setTimeout(() => {

          this.router.navigate(['/dashboard']);

        }, 1500);
      },

      error: (err) => {

        this.loading = false;

        this.errorMessage =
          err.error?.message ||
          'Unable to create account';
      }
    });
  }
}
