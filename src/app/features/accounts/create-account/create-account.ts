import { Component, OnInit } from '@angular/core';
import { APP_CONSTANTS } from '../../../app.constants';

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
currencySymbol = APP_CONSTANTS.currencySymbol;
  minDeposit: number = 0;

  interestRate: number = 0;

  maturityAmount: number = 0;

  maturityDate: Date | null = null;

  loading: boolean = false;

  successMessage: string = '';

  errorMessage: string = '';

  userName: string = '';

  userUsername: string = '';

  isProfileOpen: boolean = false;

  minInstallmentDate: string = '';

  maxInstallmentDate: string = '';

  formattedInstallmentDate: string = '';


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {

    const user =
      JSON.parse(
        localStorage.getItem('user') || '{}'
      );

    this.userName =
      user.fullName || 'User';

    this.userUsername =
      user.username || '';

    this.accountForm = this.fb.group({

      accountType: [
        '',
        Validators.required
      ],

      initialDeposit: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(10000000)
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

    // LIVE CALCULATION
    this.accountForm
      .valueChanges
      .subscribe(() => {

        this.calculateMaturity();

      });
  }

  toggleProfile(): void {

    this.isProfileOpen =
      !this.isProfileOpen;
  }

  logout(): void {

    localStorage.clear();

    this.router.navigate(['/login']);
  }

  // ACCOUNT RULES
  updateAccountRules(type: string): void {

    const tenureControl =
      this.accountForm.get('tenureMonths');

    switch (type) {

      case 'Savings':

        this.minDeposit = 500;

        this.interestRate = 3.5;

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

    // RD DATE FIELD
    // RD DATE FIELD
    if (type === 'Recurring Deposit') {

      const today = new Date();

      // Today's date
      this.minInstallmentDate =
        today.toISOString().split('T')[0];

      // Last day of current month
     const next30 = new Date();

next30.setDate(
  today.getDate() + 30
);

this.maxInstallmentDate =
  next30.toISOString().split('T')[0];

      if (
        !this.accountForm.contains(
          'installmentDate'
        )
      ) {

        this.accountForm.addControl(
          'installmentDate',
          this.fb.control(
            '',
            Validators.required
          )
        );
      }

    } else {

      if (
        this.accountForm.contains(
          'installmentDate'
        )
      ) {

        this.accountForm.removeControl(
          'installmentDate'
        );
      }
    }

    tenureControl?.updateValueAndValidity();

    // INITIAL DEPOSIT VALIDATION
    this.accountForm
      .get('initialDeposit')
      ?.setValidators([

        Validators.required,

        Validators.min(this.minDeposit),

        Validators.max(10000000)

      ]);

    this.accountForm
      .get('initialDeposit')
      ?.updateValueAndValidity();

    this.calculateMaturity();
  }

  // MATURITY CALCULATION
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

    this.maturityAmount = 0;

    this.maturityDate = null;

    if (
      !principal ||
      principal <= 0
    ) {
      return;
    }

    // FIXED DEPOSIT
    if (
      type === 'Fixed Deposit'
      &&
      months >= 6
    ) {

      // SAME AS BACKEND
      this.maturityAmount =
        principal +
        (
          principal *
          this.interestRate *
          months
          / 12
          / 100
        );

      const today = new Date();

      this.maturityDate =
        new Date(
          today.setMonth(
            today.getMonth() + months
          )
        );
    }

    // RECURRING DEPOSIT
    else if (
      type === 'Recurring Deposit'
      &&
      months >= 6
    ) {

      const monthlyDeposit = principal;

      const totalInvestment =
        monthlyDeposit * months;

      const interest =
        (
          monthlyDeposit *
          months *
          (months + 1) *
          this.interestRate
        )
        / (2 * 12 * 100);

      this.maturityAmount =
        totalInvestment + interest;

      const today = new Date();

      this.maturityDate =
        new Date(
          today.setMonth(
            today.getMonth() + months
          )
        );
    }
  }

  formatInstallmentDate(): void {

  const selectedDate =
    this.accountForm.value.installmentDate;

  if (!selectedDate) {

    this.formattedInstallmentDate = '';

    return;
  }

  const date = new Date(selectedDate);

  const day = date.getDate();

  // BLOCK 28 29 30 31
  if (day >= 28) {

    alert(
      '28, 29, 30, 31 dates are not allowed'
    );

    this.accountForm
      .get('installmentDate')
      ?.setValue('');

    this.formattedInstallmentDate = '';

    return;
  }

  let suffix = 'th';

  if (day === 1 || day === 21)
    suffix = 'st';

  else if (day === 2 || day === 22)
    suffix = 'nd';

  else if (day === 3 || day === 23)
    suffix = 'rd';

  this.formattedInstallmentDate =
    `${day}${suffix}`;
}

isInvalidDate(dateString: string): boolean {

  const date = new Date(dateString);

  const day = date.getDate();

  return (
    day === 28 ||
    day === 29 ||
    day === 30 ||
    day === 31
  );
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
        ),

      maturityDate:
        this.maturityDate,

      installmentDate:
        this.accountForm.value.installmentDate
        || null
    };

    console.log(payload);

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

          const accountData =
            res.data;

          this.router.navigate(
            ['/account-success'],
            {
              state: {
                account: {

                  accountNumber:
                    accountData.accountNumber,

                  accountType:
                    accountData.accountType,

                  balance:
                    accountData.balance,

                  interestRate:
                    accountData.interestRate,

                  maturityAmount:
                    accountData.maturityAmount,

                  maturityDate:
                    accountData.maturityDate,

                  tenureMonths:
                    accountData.tenureMonths,

                  transactionId:
                    accountData.transactionId || '',

                  createdAt:
                    new Date()
                      .toLocaleString()
                }
              }
            }
          );
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
