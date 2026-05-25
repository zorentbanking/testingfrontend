import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TransactionHistoryComponent } from './transaction-history';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TransactionHistoryComponent', () => {

  let component: TransactionHistoryComponent;
  let fixture: ComponentFixture<TransactionHistoryComponent>;
  let httpMock: HttpTestingController;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [TransactionHistoryComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        {
          provide: Router,
          useValue: routerSpy
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionHistoryComponent);

    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);

    localStorage.setItem('accessToken', 'mock-token');

    localStorage.setItem(
      'user',
      JSON.stringify({
        fullName: 'Test User',
        email: 'test@test.com',
        phone: '9999999999',
        address: 'Hyderabad',
        username: 'tester'
      })
    );
  });

  afterEach(() => {

    httpMock.match(() => true).forEach(req => req.flush({}));

    localStorage.clear();
  });

  it('should create', () => {

    fixture.detectChanges();

    const req = httpMock.expectOne(
      'https://localhost:7085/api/accounts/my'
    );

    req.flush({
      data: []
    });

    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {

    component.initForm();

    expect(component.filterForm).toBeTruthy();

    expect(component.filterForm.value.accountId).toBe('');

    expect(component.filterForm.value.type).toBe('All');
  });

  it('should load user data', () => {

    component.loadUserData();

    expect(component.userName).toBe('Test User');

    expect(component.userEmail).toBe('test@test.com');

    expect(component.userPhone).toBe('9999999999');

    expect(component.userAddress).toBe('Hyderabad');

    expect(component.userUsername).toBe('tester');
  });

  it('should toggle profile', () => {

    component.isProfileOpen = false;

    component.toggleProfile();

    expect(component.isProfileOpen).toBeTrue();

    component.toggleProfile();

    expect(component.isProfileOpen).toBeFalse();
  });

  it('should logout properly', () => {

    component.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return authorization headers', () => {

    const headers = component.getHeaders();

    expect(headers.Authorization).toContain('mock-token');
  });

  

  it('should handle load accounts error', () => {

    component.loadAccounts();

    const req = httpMock.expectOne(
      'https://localhost:7085/api/accounts/my'
    );

    req.flush(
      {},
      {
        status: 500,
        statusText: 'Server Error'
      }
    );

    expect(component.hasAccounts).toBeFalse();
  });

  it('should apply filters successfully', () => {

    component.initForm();

    component.filterForm.patchValue({
      accountId: '0',
      type: 'All'
    });

    component.applyFilters();

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/search'
    );

    expect(req.request.method).toBe('POST');

    req.flush({
      data: {
        data: [
          {
            amount: 1000,
            date: '2024-01-01'
          },
          {
            amount: 500,
            date: '2024-02-01'
          }
        ],
        totalRecords: 2
      }
    });

    expect(component.filteredTransactions.length).toBe(2);

    expect(component.paginatedTransactions.length).toBe(2);

    expect(component.loading).toBeFalse();

    expect(component.totalPages).toBe(1);
  });

  it('should handle apply filters error', () => {

    component.initForm();

    component.applyFilters();

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/search'
    );

    req.flush(
      {},
      {
        status: 500,
        statusText: 'Server Error'
      }
    );

    expect(component.loading).toBeFalse();
  });

  it('should reset filters correctly', () => {

    component.initForm();

    spyOn(component, 'applyFilters');

    component.resetFilters();

    expect(component.filterForm.value.accountId).toBe('0');

    expect(component.filterForm.value.type).toBe('All');

    expect(component.currentPage).toBe(1);

    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should sort by same column', () => {

    component.sortColumn = 'date';

    component.sortAscending = false;

    component.sortBy('date');

    expect(component.sortAscending).toBeTrue();
  });

  it('should sort by new column', () => {

    component.sortBy('amount');

    expect(component.sortColumn).toBe('amount');

    expect(component.sortAscending).toBeTrue();
  });

  it('should sort transactions ascending', () => {

    component.sortColumn = 'amount';

    component.sortAscending = true;

    const result = component.sortTransactions([
      { amount: 200 },
      { amount: 100 }
    ]);

    expect(result[0].amount).toBe(100);
  });

  it('should sort transactions descending', () => {

    component.sortColumn = 'amount';

    component.sortAscending = false;

    const result = component.sortTransactions([
      { amount: 100 },
      { amount: 200 }
    ]);

    expect(result[0].amount).toBe(200);
  });

  it('should update pagination', () => {

    component.filteredTransactions = [
      { id: 1 },
      { id: 2 }
    ];

    component.updatePagination();

    expect(component.paginatedTransactions.length).toBe(2);
  });

  it('should go to next page', () => {

    component.currentPage = 1;

    component.totalPages = 3;

    spyOn(component, 'applyFilters');

    component.nextPage();

    expect(component.currentPage).toBe(2);

    expect(component.applyFilters).toHaveBeenCalledWith(false);
  });

  it('should not go next page when already last page', () => {

    component.currentPage = 3;

    component.totalPages = 3;

    spyOn(component, 'applyFilters');

    component.nextPage();

    expect(component.currentPage).toBe(3);

    expect(component.applyFilters).not.toHaveBeenCalled();
  });

  it('should go to previous page', () => {

    component.currentPage = 2;

    spyOn(component, 'applyFilters');

    component.prevPage();

    expect(component.currentPage).toBe(1);

    expect(component.applyFilters).toHaveBeenCalledWith(false);
  });

  it('should not go previous when already first page', () => {

    component.currentPage = 1;

    spyOn(component, 'applyFilters');

    component.prevPage();

    expect(component.currentPage).toBe(1);

    expect(component.applyFilters).not.toHaveBeenCalled();
  });

  it('should export csv successfully', fakeAsync(() => {

    component.initForm();

    const mockBlob = new Blob(['test'], {
      type: 'text/csv'
    });

    spyOn(window.URL, 'createObjectURL')
      .and.returnValue('blob:test');

    spyOn(window.URL, 'revokeObjectURL');

    const mockAnchor = jasmine.createSpyObj('a', ['click']);

    spyOn(document, 'createElement')
      .and.returnValue(mockAnchor);

    component.exportCsv();

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/export'
    );

    expect(req.request.method).toBe('POST');

    req.flush(mockBlob);

    tick();

    expect(window.URL.createObjectURL).toHaveBeenCalled();

    expect(mockAnchor.click).toHaveBeenCalled();

    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  }));

  it('should handle empty user data', () => {

    localStorage.removeItem('user');

    component.loadUserData();

    expect(component.userName).toBe('');
  });

  it('should set empty transactions when no accounts found', () => {

    component.initForm();

    component.loadAccounts();

    const req = httpMock.expectOne(
      'https://localhost:7085/api/accounts/my'
    );

    req.flush({
      data: []
    });

    expect(component.filteredTransactions).toEqual([]);

    expect(component.paginatedTransactions).toEqual([]);

    expect(component.totalPages).toBe(1);
  });

});
