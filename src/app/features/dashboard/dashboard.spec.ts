import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountService } from '../../core/services/account.service';

describe('DashboardComponent', () => {

  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let mockRouter: jasmine.SpyObj<Router>;
  let mockAccountService: jasmine.SpyObj<AccountService>;

  beforeEach(async () => {

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAccountService = jasmine.createSpyObj(
      'AccountService',
      ['getMyAccounts']
    );

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
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

    fixture = TestBed.createComponent(DashboardComponent);

    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {

    mockAccountService.getMyAccounts.and.returnValue(
      of({
        success: true,
        data: []
      })
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load user data from localStorage', () => {

    const user = {
      fullName: 'Greeshma',
      email: 'greeshma@test.com',
      phone: '9999999999',
      address: 'Hyderabad',
      username: 'greeshma123'
    };

    localStorage.setItem('user', JSON.stringify(user));

    component.loadUserData();

    expect(component.userName).toBe('Greeshma');
    expect(component.userEmail).toBe('greeshma@test.com');
    expect(component.userPhone).toBe('9999999999');
    expect(component.userAddress).toBe('Hyderabad');
    expect(component.userUsername).toBe('greeshma123');
  });

  it('should load accounts successfully', () => {

    const mockResponse = {
      success: true,
      data: [
        {
          id: 1,
          accountType: 'Savings',
          balance: 1000,
          status: 'Active'
        },
        {
          id: 2,
          accountType: 'Current',
          balance: 2000,
          status: 'Active'
        },
        {
          id: 3,
          accountType: 'Savings',
          balance: 500,
          status: 'Closed'
        }
      ]
    };

    mockAccountService.getMyAccounts.and.returnValue(
      of(mockResponse)
    );

    component.loadAccounts();

    expect(component.loading).toBeFalse();

    expect(component.accounts.length).toBe(2);

    expect(component.netWorth).toBe(3000);

    expect(component.errorMessage).toBe('');
  });

  it('should handle API failure response', () => {

    const mockResponse = {
      success: false,
      message: 'Failed to load accounts'
    };

    mockAccountService.getMyAccounts.and.returnValue(
      of(mockResponse)
    );

    component.loadAccounts();

    expect(component.loading).toBeFalse();

    expect(component.errorMessage).toBe(
      'Failed to load accounts'
    );
  });

  it('should handle API error', () => {

    mockAccountService.getMyAccounts.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Unable to fetch accounts'
        }
      }))
    );

    component.loadAccounts();

    expect(component.loading).toBeFalse();

    expect(component.errorMessage).toBe(
      'Unable to fetch accounts'
    );
  });

  it('should calculate net worth correctly', () => {

    component.accounts = [
      {
        balance: 1000
      } as any,
      {
        balance: 2000
      } as any,
      {
        balance: 500
      } as any
    ];

    component.calculateNetWorth();

    expect(component.netWorth).toBe(3500);
  });

  it('should toggle profile', () => {

    expect(component.isProfileOpen).toBeFalse();

    component.toggleProfile();

    expect(component.isProfileOpen).toBeTrue();

    component.toggleProfile();

    expect(component.isProfileOpen).toBeFalse();
  });

  it('should logout and navigate to login', () => {

    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'refresh');
    localStorage.setItem('user', 'userData');

    component.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();

    expect(localStorage.getItem('refreshToken')).toBeNull();

    expect(localStorage.getItem('user')).toBeNull();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/login'
    ]);
  });

  it('should return all accounts when selectedAccountType is All', () => {

    component.accounts = [
      {
        accountType: 'Savings'
      } as any,
      {
        accountType: 'Current'
      } as any
    ];

    component.selectedAccountType = 'All';

    expect(component.filteredAccounts.length).toBe(2);
  });

  it('should filter accounts based on selectedAccountType', () => {

    component.accounts = [
      {
        accountType: 'Savings'
      } as any,
      {
        accountType: 'Current'
      } as any,
      {
        accountType: 'Savings'
      } as any
    ];

    component.selectedAccountType = 'Savings';

    expect(component.filteredAccounts.length).toBe(2);
  });

  it('should show welcome message if welcomeUser exists', fakeAsync(() => {

    localStorage.setItem('welcomeUser', 'Greeshma');

    mockAccountService.getMyAccounts.and.returnValue(
      of({
        success: true,
        data: []
      })
    );

    fixture.detectChanges();

    expect(component.showWelcomeMessage).toBeTrue();

    expect(component.welcomeUserName).toBe('Greeshma');

    tick(3500);

    expect(component.showWelcomeMessage).toBeFalse();

    expect(localStorage.getItem('welcomeUser')).toBeNull();
  }));

});
