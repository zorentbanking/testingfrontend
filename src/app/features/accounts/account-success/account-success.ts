import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { APP_CONSTANTS } from '../../../app.constants';

@Component({
  selector: 'app-account-success',
  templateUrl: './account-success.html',
  styleUrls: ['./account-success.css'],
  standalone: false
})

export class AccountSuccessComponent
  implements OnInit {

  account: any;
  currencySymbol = APP_CONSTANTS.currencySymbol;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

    const nav = window.history.state;

    this.account = nav?.account;

    // DIRECT URL ACCESS BLOCK
    if (!this.account) {

      this.router.navigate(['/dashboard']);

      return;
    }

    console.log(this.account);
  }

  goDashboard(): void {

    this.router.navigate(
      ['/dashboard'],
      {
        replaceUrl: true
      }
    );
  }
}
