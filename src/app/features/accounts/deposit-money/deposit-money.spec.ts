import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { DepositMoney } from './deposit-money';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { Router } from '@angular/router';

describe('DepositMoney', () => {

  let component: DepositMoney;

  let fixture:
    ComponentFixture<DepositMoney>;

  let httpMock:
    HttpTestingController;

  let routerMock: any;

  beforeEach(async () => {

    routerMock = {

      navigate:
        jasmine.createSpy('navigate'),

      getCurrentNavigation:
        jasmine.createSpy(
          'getCurrentNavigation'
        ).and.returnValue({

          extras: {
            state: {
              accountNumber:
                '1234567890'
            }
          }

        })

    };

    await TestBed.configureTestingModule({

      imports: [
        DepositMoney,
        HttpClientTestingModule
      ],

      providers: [
        {
          provide: Router,
          useValue: routerMock
        }
      ]

    }).compileComponents();

    fixture =
      TestBed.createComponent(
        DepositMoney
      );

    component =
      fixture.componentInstance;

    httpMock =
      TestBed.inject(
        HttpTestingController
      );

    localStorage.setItem(
      'accessToken',
      'token123'
    );

    localStorage.setItem(
      'user',
      JSON.stringify({
        fullName: 'Greeshma',
        username: 'greeshma123'
      })
    );

    fixture.detectChanges();

  });

  afterEach(() => {

    httpMock.verify();

    localStorage.clear();

  });

  function flushAccountRequest() {

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/1234567890'
      );

    expect(req.request.method)
      .toBe('GET');

    req.flush({

      success: true,

      data: {

        accountNumber:
          '1234567890',

        accountType:
          'Savings',

        availableBalance:
          5000

      }

    });

  }

  it('should create', () => {

    flushAccountRequest();

    expect(component)
      .toBeTruthy();

  });

  it('should initialize user data', () => {

    flushAccountRequest();

    expect(component.userName)
      .toBe('Greeshma');

    expect(component.userUsername)
      .toBe('greeshma123');

  });

  it('should load account successfully', () => {

    flushAccountRequest();

    expect(
      component.accountDetails.accountNumber
    ).toBe('1234567890');

    expect(
      component.accountDetails.accountType
    ).toBe('Savings');

    expect(
      component.accountDetails.availableBalance
    ).toBe(5000);

  });

  it('should handle load account failure response', () => {

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/1234567890'
      );

    req.flush({

      success: false,

      message:
        'Account not found'

    });

    expect(component.errorMessage)
      .toBe('Account not found');

  });

  it('should handle load account HTTP error', () => {

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/1234567890'
      );

    req.flush(
      {
        message:
          'Failed to load account'
      },
      {
        status: 500,
        statusText:
          'Server Error'
      }
    );

    expect(component.errorMessage)
      .toBe(
        'Failed to load account'
      );

  });

  it('should validate minimum deposit amount', () => {

    flushAccountRequest();

    component.depositAmount = 50;

    component.processDeposit();

    expect(component.errorMessage)
      .toBe(
        'Minimum deposit amount is ₹100'
      );

  });

  it('should validate maximum deposit amount', () => {

    flushAccountRequest();

    component.depositAmount = 200000;

    component.processDeposit();

    expect(component.errorMessage)
      .toBe(
        'Maximum deposit amount is ₹100000'
      );

  });

  it('should process deposit successfully', () => {

    flushAccountRequest();

    component.depositAmount =
      1000;

    component.processDeposit();

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/deposit'
      );

    expect(req.request.method)
      .toBe('POST');

    expect(req.request.body)
      .toEqual({

        accountNumber:
          '1234567890',

        amount: 1000

      });

    req.flush({

      success: true,

      data: {

        transactionId:
          'TXN123',

        balance:
          6000

      }

    });

    expect(component.isSuccess)
      .toBeTrue();

    expect(component.transactionId)
      .toBe('TXN123');

    expect(
      component.accountDetails
        .availableBalance
    ).toBe(6000);

  });

  it('should handle deposit failure response', () => {

    flushAccountRequest();

    component.depositAmount =
      1000;

    component.processDeposit();

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/deposit'
      );

    req.flush({

      success: false,

      message:
        'Deposit failed'

    });

    expect(component.errorMessage)
      .toBe('Deposit failed');

  });

  it('should handle deposit HTTP error', () => {

    flushAccountRequest();

    component.depositAmount =
      1000;

    component.processDeposit();

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/deposit'
      );

    req.flush(
      {
        message:
          'Server Error'
      },
      {
        status: 500,
        statusText:
          'Server Error'
      }
    );

    expect(component.errorMessage)
      .toBe('Server Error');

  });

  it('should toggle profile', () => {

    flushAccountRequest();

    expect(component.isProfileOpen)
      .toBeFalse();

    component.toggleProfile();

    expect(component.isProfileOpen)
      .toBeTrue();

  });

  it('should navigate to dashboard', () => {

    flushAccountRequest();

    component.navDashboard();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/dashboard'
    ]);

  });

  it('should logout', () => {

    flushAccountRequest();

    spyOn(
      localStorage,
      'clear'
    );

    component.logout();

    expect(
      localStorage.clear
    ).toHaveBeenCalled();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/login'
    ]);

  });

});
