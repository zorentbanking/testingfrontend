import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CloseFd } from './close-fd';

import { Router, ActivatedRoute } from '@angular/router';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('CloseFd', () => {

  let component: CloseFd;
  let fixture: ComponentFixture<CloseFd>;
  let httpMock: HttpTestingController;

  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate']
    );

    await TestBed.configureTestingModule({

      declarations: [CloseFd],

      imports: [
        HttpClientTestingModule
      ],

      providers: [
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              accountNumber: '1234567890'
            })
          }
        }
      ],

      schemas: [NO_ERRORS_SCHEMA]

    }).compileComponents();

    fixture =
      TestBed.createComponent(CloseFd);

    component =
      fixture.componentInstance;

    httpMock =
      TestBed.inject(HttpTestingController);

    localStorage.setItem(
      'user',
      JSON.stringify({
        fullName: 'Test User',
        username: 'testuser'
      })
    );

    localStorage.setItem(
      'accessToken',
      'fake-token'
    );

  });

  afterEach(() => {

    httpMock.verify();

    localStorage.clear();

  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

  it('should initialize user details and load deposit details', () => {

    fixture.detectChanges();

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/1234567890'
      );

    expect(req.request.method)
      .toBe('GET');

    req.flush({
      success: true,
      data: {
        accountNumber: '1234567890',
        accountType: 'Fixed Deposit',
        availableBalance: 10000,
        interestRate: 5,
        maturityAmount: 12000,
        earnedInterest: 500,
        createdAt: new Date(),
        tenureMonths: 12,
        paidInstallments: 5
      }
    });

    expect(component.userName)
      .toBe('Test User');

    expect(component.userUsername)
      .toBe('testuser');

    expect(component.fdDetails.fdAccountNumber)
      .toBe('1234567890');

  });

  it('should handle loadDepositDetails API error', () => {

    fixture.detectChanges();

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/1234567890'
      );

    req.flush(
      {
        message:
          'Failed to load account details'
      },
      {
        status: 500,
        statusText: 'Server Error'
      }
    );

    expect(component.loading)
      .toBeFalse();

    expect(component.errorMessage)
      .toBe(
        'Failed to load account details'
      );

  });

  it('should toggle profile', () => {

    expect(component.isProfileOpen)
      .toBeFalse();

    component.toggleProfile();

    expect(component.isProfileOpen)
      .toBeTrue();

    component.toggleProfile();

    expect(component.isProfileOpen)
      .toBeFalse();

  });

  it('should logout and navigate to login', () => {

    spyOn(localStorage, 'clear');

    component.logout();

    expect(localStorage.clear)
      .toHaveBeenCalled();

    expect(routerSpy.navigate)
      .toHaveBeenCalledWith(
        ['/login']
      );

  });

  it('should return 0 days when no startDate', () => {

    component.fdDetails = {};

    expect(
      component.getDaysCompleted()
    ).toBe(0);

  });

  it('should calculate completed days correctly', () => {

    const oldDate =
      new Date();

    oldDate.setDate(
      oldDate.getDate() - 10
    );

    component.fdDetails = {
      startDate: oldDate
    };

    expect(
      component.getDaysCompleted()
    ).toBeGreaterThanOrEqual(10);

  });

  it('should return 0 totalInterest when principal missing', () => {

    component.fdDetails = {};

    expect(component.totalInterest)
      .toBe(0);

  });

  it('should return earned interest after success', () => {

    component.isSuccess = true;

    component.fdDetails = {
      principal: 10000,
      earnedInterest: 500
    };

    expect(component.totalInterest)
      .toBe(500);

  });

  it('should return 0 for checking account interest', () => {

    component.fdDetails = {
      principal: 10000,
      accountType: 'Checking'
    };

    expect(component.totalInterest)
      .toBe(0);

  });

  it('should return 0 for recurring deposit before success', () => {

    component.isSuccess = false;

    component.fdDetails = {
      principal: 10000,
      accountType: 'Recurring Deposit',
      earnedInterest: 400
    };

    expect(component.totalInterest)
      .toBe(0);

  });

  it('should return recurring deposit earned interest after success', () => {

    component.isSuccess = true;

    component.fdDetails = {
      principal: 10000,
      accountType: 'Recurring Deposit',
      earnedInterest: 400
    };

    expect(component.totalInterest)
      .toBe(400);

  });

  it('should calculate fixed deposit interest', () => {

    const oldDate =
      new Date();

    oldDate.setFullYear(
      oldDate.getFullYear() - 1
    );

    component.fdDetails = {
      principal: 10000,
      interestRate: 10,
      accountType: 'Fixed Deposit',
      startDate: oldDate
    };

    const interest =
      component.totalInterest;

    expect(interest)
      .toBeGreaterThan(900);

  });

  it('should return final payout after success', () => {

    component.isSuccess = true;

    component.fdDetails = {
      amount: 12000
    };

    expect(component.finalPayout)
      .toBe(12000);

  });

  it('should calculate final payout before success', () => {

    component.isSuccess = false;

    component.fdDetails = {
      principal: 10000
    };

    spyOnProperty(
      component,
      'totalInterest',
      'get'
    ).and.returnValue(1000);

    expect(component.finalPayout)
      .toBe(11000);

  });

  it('should validate empty target account', () => {

    component.targetAccount = '';

    component.processClosure();

    expect(component.errorMessage)
      .toBe(
        'Please enter target account number'
      );

  });

  it('should validate non numeric target account', () => {

    component.targetAccount = 'abc123';

    component.processClosure();

    expect(component.errorMessage)
      .toBe(
        'Account number must contain only numbers'
      );

  });

  it('should validate short target account', () => {

    component.targetAccount = '12345';

    component.processClosure();

    expect(component.errorMessage)
      .toBe(
        'Invalid account number'
      );

  });

  it('should block same account transfer', () => {

    component.fdDetails = {
      fdAccountNumber: '1234567890'
    };

    component.targetAccount =
      '1234567890';

    component.processClosure();

    expect(component.errorMessage)
      .toBe(
        'Cannot transfer to same account'
      );

  });

  it('should process closure successfully', () => {

    component.fdDetails = {
      fdAccountNumber: '1111111111'
    };

    component.targetAccount =
      '2222222222';

    component.processClosure();

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/close-deposit'
      );

    expect(req.request.method)
      .toBe('POST');

    req.flush({
      data: {
        transactionId: 'TXN123',
        earnedInterest: 700,
        amount: 10700
      }
    });

    expect(component.loading)
      .toBeFalse();

    expect(component.isSuccess)
      .toBeTrue();

    expect(component.transactionId)
      .toBe('TXN123');

    expect(component.fdDetails.earnedInterest)
      .toBe(700);

    expect(component.fdDetails.amount)
      .toBe(10700);

  });

  it('should handle process closure error', () => {

    component.fdDetails = {
      fdAccountNumber: '1111111111'
    };

    component.targetAccount =
      '2222222222';

    component.processClosure();

    const req =
      httpMock.expectOne(
        'https://localhost:7085/api/accounts/close-deposit'
      );

    req.flush(
      {
        message: 'Closure failed'
      },
      {
        status: 400,
        statusText: 'Bad Request'
      }
    );

    expect(component.loading)
      .toBeFalse();

    expect(component.errorMessage)
      .toBe('Closure failed');

  });

  it('should navigate to dashboard', () => {

    component.navDashboard();

    expect(routerSpy.navigate)
      .toHaveBeenCalledWith(
        ['/dashboard']
      );

  });

});
