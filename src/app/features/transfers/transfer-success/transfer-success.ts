import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-transfer-success',
  templateUrl: './transfer-success.html',
  styleUrls: ['./transfer-success.css'],
  standalone: false
})

export class TransferSuccessComponent implements OnInit {

  transaction: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

    const nav = window.history.state;

    this.transaction =
      nav?.transaction;

    if (!this.transaction) {

      this.router.navigate(['/dashboard']);

      return;
    }

    console.log(this.transaction);
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
