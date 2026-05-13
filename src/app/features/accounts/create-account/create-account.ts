import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { AccountService }
  from '../../../core/services/account.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.css'],
  standalone: false
})

export class CreateAccountComponent
  implements OnInit {

  accountForm!: FormGroup;

  minDeposit: number = 0;

  interestRate: number = 0;

  maturityAmount: number = 0;

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

      accountType: [
        '',
        Validators.required
      ],

      initialDeposit: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      tenureMonths: ['']
    });

    // ACCOUNT TYPE CHANGE
    this.accountForm
      .get('accountType')
      ?.valueChanges
      .subscribe(type => {

        this.updateAccountRules(type);

      });

    // LIVE MATURITY CALCULATION
    this.accountForm.valueChanges
      .subscribe(() => {

        this.calculateMaturity();

      });
  }

  // UPDATE RULES
  updateAccountRules(type: string): void {

    const tenureControl =
      this.accountForm.get('tenureMonths');

    switch (type) {

      case 'Savings':

        this.minDeposit = 500;

        this.interestRate = 3;

        tenureControl?.clearValidators();

        tenureControl?.setValue('');

        break;

      case 'Checking':

        this.minDeposit = 100;

        this.interestRate = 0;

        tenureControl?.clearValidators();

        tenureControl?.setValue('');

        break;

      case 'Fixed Deposit':

        this.minDeposit = 1000;

        this.interestRate = 7.5;

        tenureControl?.setValidators([

          Validators.required,

          Validators.min(6),

          Validators.max(120)

        ]);

        break;

      case 'Recurring Deposit':

        this.minDeposit = 100;

        this.interestRate = 6.5;

        tenureControl?.setValidators([

          Validators.required,

          Validators.min(6),

          Validators.max(120)

        ]);

        break;

      default:

        this.minDeposit = 0;

        this.interestRate = 0;

        tenureControl?.clearValidators();
    }

    tenureControl?.updateValueAndValidity();

    // INITIAL DEPOSIT VALIDATION
    this.accountForm
      .get('initialDeposit')
      ?.setValidators([

        Validators.required,

        Validators.min(this.minDeposit)

      ]);

    this.accountForm
      .get('initialDeposit')
      ?.updateValueAndValidity();

    this.calculateMaturity();
  }

  // CALCULATE MATURITY
  calculateMaturity(): void {

    const type =
      this.accountForm.value.accountType;

    const principal =
      Number(
        this.accountForm.value.initialDeposit
      );

    const months =
      Number(
        this.accountForm.value.tenureMonths
      );

    // RESET
    this.maturityAmount = 0;

    if (
      !principal ||
      principal <= 0
    ) {
      return;
    }

    // FD
    if (
      type === 'Fixed Deposit'
      &&
      months >= 6
    ) {

      const years = months / 12;

      this.maturityAmount =
        principal *
        Math.pow(
          (
            1 + (
              this.interestRate / 100 / 4
            )
          ),
          4 * years
        );
    }

    // RD
    else if (
      type === 'Recurring Deposit'
      &&
      months >= 6
    ) {

      const monthlyInvestment =
        principal;

      const totalInvestment =
        monthlyInvestment * months;

      const interest =
        (
          totalInvestment *
          this.interestRate *
          months
        ) / (12 * 100);

      this.maturityAmount =
        totalInvestment + interest;
    }
  }

  // SUBMIT
  onSubmit(): void {

    if (this.accountForm.invalid) {

      this.accountForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.successMessage = '';

    this.errorMessage = '';

    const payload = {

      type:
        this.accountForm.value.accountType,

      initialDeposit:
        Number(
          this.accountForm.value.initialDeposit
        ),

      tenureMonths:
        this.accountForm.value.tenureMonths
          ? Number(
            this.accountForm.value.tenureMonths
          )
          : null,

      interestRate:
        this.interestRate,

      maturityAmount:
        Number(
          this.maturityAmount.toFixed(2)
        )
    };

    this.accountService
      .createAccount(payload)
      .subscribe({

        next: (res: any) => {

          this.loading = false;

          if (!res.success) {

            this.errorMessage =
              res.message ||
              'Account creation failed';

            return;
          }

          this.successMessage =
            res.message ||
            'Account created successfully';

          this.accountForm.reset();

          this.maturityAmount = 0;

          setTimeout(() => {

            this.router.navigate([
              '/dashboard'
            ]);

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
