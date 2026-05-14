import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';

import { App } from './app';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard';

import { CreateAccountComponent } from './features/accounts/create-account/create-account';
import { TransferComponent } from './features/transfers/transfer/transfer';
import { TransactionHistoryComponent } from './features/transactions/transaction-history/transaction-history';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { TransferSuccessComponent } from './features/transfers/transfer-success/transfer-success';
import { StatementComponent } from './features/transactions/statement/statement';
import { ProfileSettingsComponent } from './features/accounts/profile-settings/profile-settings';
import { AccountSuccessComponent }
  from './features/accounts/account-success/account-success';
@NgModule({
  declarations: [
    App,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CreateAccountComponent,
    TransferComponent,
    TransactionHistoryComponent,
    TransferSuccessComponent,
    AccountSuccessComponent,
    StatementComponent,
    ProfileSettingsComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],

  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],

  bootstrap: [App]
})

export class AppModule { }
