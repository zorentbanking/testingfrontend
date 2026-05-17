import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard';

import { CreateAccountComponent } from './features/accounts/create-account/create-account';
import { TransferComponent } from './features/transfers/transfer/transfer';
import { TransactionHistoryComponent } from './features/transactions/transaction-history/transaction-history';
import { DepositMoney } from './features/accounts/deposit-money/deposit-money';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ChangePasswordComponent } from './features/auth/change-password/change-password';
import { TransferSuccessComponent } from './features/transfers/transfer-success/transfer-success';
import { StatementComponent } from './features/transactions/statement/statement';
import { ProfileSettingsComponent } from './features/accounts/profile-settings/profile-settings';
import { ClosedAccountsComponent } from './features/closed-accounts/closed-accounts';
import { CloseFd } from './features/Close/close-fd';
import { AccountSuccessComponent }
  from './features/accounts/account-success/account-success';

import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [

  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  // PUBLIC ROUTES
  { path: 'forgot-password', component: ForgotPasswordComponent },

  { path: 'reset-password', component: ChangePasswordComponent },

  // PROTECTED ROUTES
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'closed-accounts',
    component: ClosedAccountsComponent
     
  },
  {
    path: 'deposit-money',
    component: DepositMoney
  },
  {
    path: 'close-fd',
    component: CloseFd,
    canActivate: [AuthGuard]
  },

  {
    path: 'create-account',
    component: CreateAccountComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'transfer',
    component: TransferComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'transactions',
    component: TransactionHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'transfer-success',
    component: TransferSuccessComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account-success',
    component: AccountSuccessComponent
  },
  {
    path: 'statement',
    component: StatementComponent
  },
  {
    path: 'profile-settings',
    component: ProfileSettingsComponent
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
