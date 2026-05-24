import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreateAccountComponent } from './create-account';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountService } from '../../../core/services/account.service';

describe('CreateAccountComponent', () => {

  let component: CreateAccountComponent;
  let fixture: ComponentFixture<CreateAccountComponent>;

  let mockRouter: jasmine.SpyObj<Router>;
  let mockAccountService: jasmine.SpyObj<AccountService>;

  beforeEach(async () => {

    mockRouter = jasmine.createSpyObj(
      'Router',
      ['navigate']
    );

    mockAccountService = jasmine.createSpyObj(
      'AccountService',
      ['createAccount']
    );

    await TestBed.configureTestingModule({
      declarations: [CreateAccountComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: AccountService,
          useValue: mockAccountService
        }
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        CreateAccountComponent
      );

    component = fixture.componentInstance;

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
    localStorage.clear();
  });

  it('should create component', () => {

    expect(component).toBeTruthy();

  });

  it('should initialize form controls', () => {

    expect(component.accountForm).toBeTruthy();

    expect(
      component.accountForm.contains('accountType')
    ).toBeTrue();

    expect(
      component.accountForm.contains('initialDeposit')
    ).toBeTrue();

    expect(
      component.accountForm.contains('tenureMonths')
    ).toBeTrue();
  });

  it('should load user data from localStorage', () => {

    expect(component.userName)
      .toBe('Greeshma');

    expect(component.userUsername)
      .toBe('greeshma123');
  });

  it('should toggle profile menu', () => {

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

    expect(mockRouter.navigate)
      .toHaveBeenCalledWith(['/login']);
  });

  it('should update rules for Savings account', () => {

    component.updateAccountRules('Savings');

    expect(component.minDeposit)
      .toBe(500);

    expect(component.interestRate)
      .toBe(3.5);
  });

  it('should update rules for Checking account', () => {

    component.updateAccountRules('Checking');

    expect(component.minDeposit)
      .toBe(100);

    expect(component.interestRate)
      .toBe(0);
  });

  it('should update rules for Fixed Deposit account', () => {

    component.updateAccountRules(
      'Fixed Deposit'
    );

    expect(component.minDeposit)
      .toBe(1000);

    expect(component.interestRate)
      .toBe(7.5);
  });

  it('should update rules for Recurring Deposit account', () => {

    component.updateAccountRules(
      'Recurring Deposit'
    );

    expect(component.minDeposit)
      .toBe(100);

    expect(component.interestRate)
      .toBe(6.5);

    expect(
      component.accountForm.contains(
        'installmentDate'
      )
    ).toBeTrue();
  });

  it('should remove installmentDate control for non RD account', () => {

    component.updateAccountRules(
      'Recurring Deposit'
    );

    expect(
      component.accountForm.contains(
        'installmentDate'
      )
    ).toBeTrue();

    component.updateAccountRules('Savings');

    expect(
      component.accountForm.contains(
        'installmentDate'
      )
    ).toBeFalse();
  });

  it('should calculate maturity for Fixed Deposit', () => {

    component.accountForm.patchValue({
      accountType: 'Fixed Deposit',
      initialDeposit: 10000,
      tenureMonths: 12
    });

    component.interestRate = 7.5;

    component.calculateMaturity();

    expect(component.maturityAmount)
      .toBeGreaterThan(10000);

    expect(component.maturityDate)
      .not.toBeNull();
  });

  it('should calculate maturity for Recurring Deposit', () => {

    component.accountForm.patchValue({
      accountType: 'Recurring Deposit',
      initialDeposit: 1000,
      tenureMonths: 12
    });

    component.interestRate = 6.5;

    component.calculateMaturity();

    expect(component.maturityAmount)
      .toBeGreaterThan(12000);

    expect(component.maturityDate)
      .not.toBeNull();
  });

  it('should not calculate maturity for invalid principal', () => {

    component.accountForm.patchValue({
      accountType: 'Fixed Deposit',
      initialDeposit: 0,
      tenureMonths: 12
    });

    component.calculateMaturity();

    expect(component.maturityAmount)
      .toBe(0);

    expect(component.maturityDate)
      .toBeNull();
  });

  it('should mark form touched if invalid on submit', () => {

    spyOn(
      component.accountForm,
      'markAllAsTouched'
    );

    component.onSubmit();

    expect(
      component.accountForm.markAllAsTouched
    ).toHaveBeenCalled();
  });

  it('should create account successfully', fakeAsync(() => {

    component.accountForm.patchValue({
      accountType: 'Savings',
      initialDeposit: 500
    });

    component.interestRate = 3.5;

    mockAccountService.createAccount
      .and.returnValue(
        of({
          success: true,
          data: {
            accountNumber: '123456789',
            accountType: 'Savings',
            balance: 500,
            interestRate: 3.5,
            maturityAmount: 0,
            maturityDate: null,
            tenureMonths: null,
            transactionId: 'TXN123'
          }
        })
      );

    component.onSubmit();

    tick();

    expect(
      mockAccountService.createAccount
    ).toHaveBeenCalled();

    expect(mockRouter.navigate)
      .toHaveBeenCalled();

    expect(component.loading)
      .toBeFalse();
  }));

  it('should handle failed account creation response', fakeAsync(() => {

    component.accountForm.patchValue({
      accountType: 'Savings',
      initialDeposit: 500
    });

    mockAccountService.createAccount
      .and.returnValue(
        of({
          success: false,
          message: 'Creation failed'
        })
      );

    component.onSubmit();

    tick();

    expect(component.errorMessage)
      .toBe('Creation failed');

    expect(component.loading)
      .toBeFalse();
  }));

  it('should handle API error during account creation', fakeAsync(() => {

    component.accountForm.patchValue({
      accountType: 'Savings',
      initialDeposit: 500
    });

    mockAccountService.createAccount
      .and.returnValue(
        throwError(() => ({
          error: {
            message: 'Server Error'
          }
        }))
      );

    component.onSubmit();

    tick();

    expect(component.errorMessage)
      .toBe('Server Error');

    expect(component.loading)
      .toBeFalse();
  }));

  it('should set loading true during submit', () => {

    component.accountForm.patchValue({
      accountType: 'Savings',
      initialDeposit: 500
    });

    mockAccountService.createAccount
      .and.returnValue(
        of({
          success: true,
          data: {}
        })
      );

    component.onSubmit();

    expect(component.loading)
      .toBeFalse();
  });

  it('should validate minimum deposit correctly', () => {

    component.updateAccountRules('Savings');

    component.accountForm.patchValue({
      initialDeposit: 100
    });

    const control =
      component.accountForm.get(
        'initialDeposit'
      );

    expect(control?.invalid)
      .toBeTrue();
  });

  it('should validate tenure for Fixed Deposit', () => {

    component.updateAccountRules(
      'Fixed Deposit'
    );

    component.accountForm.patchValue({
      tenureMonths: 3
    });

    const control =
      component.accountForm.get(
        'tenureMonths'
      );

    expect(control?.invalid)
      .toBeTrue();
  });

});
