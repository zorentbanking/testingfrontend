import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';

import { TransferComponent } from './transfer';

import {
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import { AccountService } from '../../../core/services/account.service';

import { TransactionService } from '../../../core/services/transaction.service';

describe('TransferComponent', () => {

  let component: TransferComponent;

  let fixture: ComponentFixture<TransferComponent>;

  let accountServiceSpy: jasmine.SpyObj<AccountService>;

  let transactionServiceSpy: jasmine.SpyObj<TransactionService>;

  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    accountServiceSpy = jasmine.createSpyObj(
      'AccountService',
      [
        'getMyAccounts',
        'validateAccount'
      ]
    );

    transactionServiceSpy = jasmine.createSpyObj(
      'TransactionService',
      [
        'transfer'
      ]
    );

    routerSpy = jasmine.createSpyObj(
      'Router',
      [
        'navigate'
      ]
    );

    accountServiceSpy.getMyAccounts.and.returnValue(
      of({
        success: true,
        data: [
          {
            id: 1,
            accountNumber: '1234567890',
            balance: 10000,
            accountType: 'Savings',
            status: 'Active'
          },
          {
            id: 2,
            accountNumber: '1111111111',
            balance: 5000,
            accountType: 'Checking',
            status: 'Active'
          }
        ]
      })
    );

    accountServiceSpy.validateAccount.and.returnValue(
      of({
        success: true
      })
    );

    await TestBed.configureTestingModule({

      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule
      ],

      declarations: [
        TransferComponent
      ],

      providers: [
        FormBuilder,
        {
          provide: AccountService,
          useValue: accountServiceSpy
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy
        },
        {
          provide: Router,
          useValue: routerSpy
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        TransferComponent
      );

    component =
      fixture.componentInstance;

    localStorage.setItem(
      'user',
      JSON.stringify({
        fullName: 'Greeshma',
        email: 'test@test.com',
        phone: '9999999999',
        address: 'Hyderabad',
        username: 'greeshma'
      })
    );

    fixture.detectChanges();
  });

  afterEach(() => {

    localStorage.clear();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });

  it('should load accounts', () => {

    expect(component.myAccounts.length)
      .toBe(2);
  });

  it('should load user data', () => {

    expect(component.userName)
      .toBe('Greeshma');

    expect(component.userEmail)
      .toBe('test@test.com');
  });

  it('should make form invalid when empty', () => {

    expect(component.transferForm.valid)
      .toBeFalse();
  });

  it('should validate toAccount pattern', () => {

    const control =
      component.transferForm.get('toAccount');

    control?.setValue('123');

    expect(control?.valid)
      .toBeFalse();

    control?.setValue('1234567890');

    expect(control?.valid)
      .toBeTrue();
  });

  it('should allow only numbers', () => {

    const event = {
      which: 65,
      preventDefault: jasmine.createSpy()
    } as any;

    component.allowOnlyNumbers(event);

    expect(event.preventDefault)
      .toHaveBeenCalled();
  });

  it('should not prevent number input', () => {

    const event = {
      which: 50,
      preventDefault: jasmine.createSpy()
    } as any;

    component.allowOnlyNumbers(event);

    expect(event.preventDefault)
      .not.toHaveBeenCalled();
  });

  it('should toggle profile', () => {

    component.isProfileOpen = false;

    component.toggleProfile();

    expect(component.isProfileOpen)
      .toBeTrue();
  });

  it('should logout user', () => {

    localStorage.setItem(
      'accessToken',
      'token'
    );

    component.logout();

    expect(localStorage.getItem('accessToken'))
      .toBeNull();

    expect(routerSpy.navigate)
      .toHaveBeenCalledWith(
        ['/login']
      );
  });

  it('should validate same account transfer', () => {

    component.transferForm
      .get('fromAccount')
      ?.setValue('1');

    component.validateDestinationAccount(
      '1234567890'
    );

    expect(
      component.transferForm
        .get('toAccount')
        ?.hasError('sameAccount')
    ).toBeTrue();
  });

  it('should set accountNotFound error', () => {

    accountServiceSpy.validateAccount
      .and.returnValue(
        of({
          success: false
        })
      );

    component.validateDestinationAccount(
      '9999999999'
    );

    expect(
      component.transferForm
        .get('toAccount')
        ?.hasError('accountNotFound')
    ).toBeTrue();
  });

  it('should handle validate account API error', () => {

    accountServiceSpy.validateAccount
      .and.returnValue(
        throwError(() => ({
          error: 'Error'
        }))
      );

    component.validateDestinationAccount(
      '9999999999'
    );

    expect(
      component.transferForm
        .get('toAccount')
        ?.hasError('accountNotFound')
    ).toBeTrue();
  });

  it('should mark form touched when invalid submit', () => {

    spyOn(
      component.transferForm,
      'markAllAsTouched'
    );

    component.onSubmit();

    expect(
      component.transferForm
        .markAllAsTouched
    ).toHaveBeenCalled();
  });

  it('should transfer successfully', () => {

    transactionServiceSpy.transfer
      .and.returnValue(
        of({
          success: true,
          data: {
            transactionId: 'TX123'
          }
        })
      );

    component.transferForm.setValue({
      fromAccount: '1',
      toAccount: '9999999999',
      amount: 1000,
      description: 'Test transfer'
    });

    component.onSubmit();

    expect(
      transactionServiceSpy.transfer
    ).toHaveBeenCalled();

    expect(routerSpy.navigate)
      .toHaveBeenCalled();
  });

  it('should handle transfer failure response', () => {

    transactionServiceSpy.transfer
      .and.returnValue(
        of({
          success: false,
          message: 'Transfer failed'
        })
      );

    component.transferForm.setValue({
      fromAccount: '1',
      toAccount: '9999999999',
      amount: 1000,
      description: 'Test'
    });

    component.onSubmit();

    expect(component.errorMessage)
      .toBe('Transfer failed');
  });

  it('should handle transfer API error', () => {

    transactionServiceSpy.transfer
      .and.returnValue(
        throwError(() => ({
          error: {
            message: 'API Error'
          }
        }))
      );

    component.transferForm.setValue({
      fromAccount: '1',
      toAccount: '9999999999',
      amount: 1000,
      description: 'Test'
    });

    component.onSubmit();

    expect(component.errorMessage)
      .toBe('API Error');
  });

  it('should block fixed deposit transfer', () => {

    component.myAccounts = [
      {
        id: 10,
        accountNumber: '2222222222',
        balance: 10000,
        accountType: 'Fixed Deposit',
        status: 'Active'
      } as any
    ];

    component.transferForm.setValue({
      fromAccount: '10',
      toAccount: '9999999999',
      amount: 500,
      description: 'Test'
    });

    component.onSubmit();

    expect(component.errorMessage)
      .toContain(
        'Transactions are not allowed'
      );
  });

  it('should set minimum balance for savings account', fakeAsync(() => {

    component.transferForm
      .get('fromAccount')
      ?.setValue('1');

    tick();

    expect(component.minimumBalance)
      .toBe(500);
  }));

  it('should call validate account after debounce', fakeAsync(() => {

    spyOn(
      component,
      'validateDestinationAccount'
    );

    component.transferForm
      .get('toAccount')
      ?.setValue('9999999999');

    tick(500);

    expect(
      component.validateDestinationAccount
    ).toHaveBeenCalledWith(
      '9999999999'
    );
  }));

  it('should handle load accounts error', () => {

    accountServiceSpy.getMyAccounts
      .and.returnValue(
        throwError(() => ({
          error: 'Error'
        }))
      );

    component.loadMyAccounts();

    expect(component.errorMessage)
      .toBe('Unable to load accounts');
  });

});
