import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClosedAccountsComponent } from './closed-accounts';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ClosedAccountsComponent', () => {
  let component: ClosedAccountsComponent;
  let fixture: ComponentFixture<ClosedAccountsComponent>;

  let mockRouter: jasmine.SpyObj<Router>;
  let mockAccountService: jasmine.SpyObj<AccountService>;

  beforeEach(async () => {

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAccountService = jasmine.createSpyObj(
      'AccountService',
      ['getMyAccounts']
    );

    await TestBed.configureTestingModule({
      declarations: [ClosedAccountsComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: AccountService,
          useValue: mockAccountService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        ClosedAccountsComponent
      );

    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadUserData and loadClosedAccounts on ngOnInit', () => {

    spyOn(component, 'loadUserData');
    spyOn(component, 'loadClosedAccounts');

    component.ngOnInit();

    expect(component.loadUserData)
      .toHaveBeenCalled();

    expect(component.loadClosedAccounts)
      .toHaveBeenCalled();
  });

  it('should load user data from localStorage', () => {

    const mockUser = {
      fullName: 'Greeshma',
      email: 'greeshma@test.com',
      phone: '9876543210',
      address: 'Hyderabad',
      username: 'greeshma123'
    };

    localStorage.setItem(
      'user',
      JSON.stringify(mockUser)
    );

    component.loadUserData();

    expect(component.userName)
      .toBe('Greeshma');

    expect(component.userEmail)
      .toBe('greeshma@test.com');

    expect(component.userPhone)
      .toBe('9876543210');

    expect(component.userAddress)
      .toBe('Hyderabad');

    expect(component.userUsername)
      .toBe('greeshma123');
  });

  it('should keep default values if no user data in localStorage', () => {

    localStorage.removeItem('user');

    component.loadUserData();

    expect(component.userName)
      .toBe('User');

    expect(component.userEmail)
      .toBe('');

    expect(component.userPhone)
      .toBe('');

    expect(component.userAddress)
      .toBe('');

    expect(component.userUsername)
      .toBe('');
  });

  it('should load closed accounts successfully', () => {

    const mockResponse = {
      data: [
        {
          id: 1,
          balance: 1000,
          status: 'Closed'
        },
        {
          id: 2,
          balance: 2000,
          status: 'Active'
        },
        {
          id: 3,
          balance: 3000,
          status: 'Closed'
        }
      ]
    };

    mockAccountService.getMyAccounts
      .and.returnValue(of(mockResponse));

    component.loadClosedAccounts();

    expect(component.loading)
      .toBeFalse();

    expect(component.closedAccounts.length)
      .toBe(2);

    expect(component.accounts.length)
      .toBe(2);

    expect(component.netWorth)
      .toBe(4000);
  });

  it('should handle error while loading closed accounts', () => {

    const mockError = {
      error: {
        message: 'API Error'
      }
    };

    mockAccountService.getMyAccounts
      .and.returnValue(
        throwError(() => mockError)
      );

    component.loadClosedAccounts();

    expect(component.loading)
      .toBeFalse();

    expect(component.errorMessage)
      .toBe('API Error');
  });

  it('should set default error message if API error message is absent', () => {

    mockAccountService.getMyAccounts
      .and.returnValue(
        throwError(() => ({}))
      );

    component.loadClosedAccounts();

    expect(component.errorMessage)
      .toBe(
        'Failed to load closed accounts'
      );
  });

  it('should calculate net worth correctly', () => {

    component.accounts = [
      { balance: 1000 },
      { balance: 2000 },
      { balance: 3000 }
    ];

    component.calculateNetWorth();

    expect(component.netWorth)
      .toBe(6000);
  });

  it('should toggle profile state', () => {

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

    localStorage.setItem(
      'accessToken',
      'token'
    );

    localStorage.setItem(
      'refreshToken',
      'refresh'
    );

    localStorage.setItem(
      'user',
      'userdata'
    );

    component.logout();

    expect(
      localStorage.getItem('accessToken')
    ).toBeNull();

    expect(
      localStorage.getItem('refreshToken')
    ).toBeNull();

    expect(
      localStorage.getItem('user')
    ).toBeNull();

    expect(mockRouter.navigate)
      .toHaveBeenCalledWith(['/login']);
  });

});
