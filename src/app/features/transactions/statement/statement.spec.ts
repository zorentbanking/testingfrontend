import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatementComponent } from './statement';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { of } from 'rxjs';

describe('StatementComponent', () => {

  let component: StatementComponent;
  let fixture: ComponentFixture<StatementComponent>;
  let httpMock: HttpTestingController;

  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate']
    );

    await TestBed.configureTestingModule({

      declarations: [StatementComponent],

      imports: [
        HttpClientTestingModule
      ],

      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              accountNumber: '1234567890'
            })
          }
        },
        {
          provide: Router,
          useValue: routerSpy
        }
      ]

    }).compileComponents();

    fixture =
      TestBed.createComponent(
        StatementComponent
      );

    component =
      fixture.componentInstance;

    httpMock =
      TestBed.inject(
        HttpTestingController
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

  it('should initialize user details from localStorage', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush({
      data: {
        customerName: '',
        customerId: 0,
        accountNumber: '',
        accountType: '',
        availableBalance: 0,
        transactions: []
      }
    });

    expect(component.userName)
      .toBe('Greeshma');

    expect(component.userUsername)
      .toBe('greeshma123');

  });

  it('should load statement successfully', () => {

    const mockResponse = {

      data: {

        customerName: 'Greeshma',

        customerId: 101,

        accountNumber: '1234567890',

        accountType: 'Savings',

        availableBalance: 5000,

        interestRate: 7,

        durationMonths: 12,

        maturityDate: '2026-12-31',

        maturityAmount: 6000,

        installmentDate: '2026-06-01',

        totalInstallments: 12,

        paidInstallments: 5,

        remainingInstallments: 7,

        transactions: [
          {
            id: 1,
            amount: 1000
          },
          {
            id: 2,
            amount: 2000
          }
        ]

      }

    };

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    expect(req.request.method)
      .toBe('GET');

    req.flush(mockResponse);

    expect(component.customerName)
      .toBe('Greeshma');

    expect(component.customerId)
      .toBe(101);

    expect(component.accountNumber)
      .toBe('1234567890');

    expect(component.accountType)
      .toBe('Savings');

    expect(component.availableBalance)
      .toBe(5000);

    expect(component.interestRate)
      .toBe(7);

    expect(component.durationMonths)
      .toBe(12);

    expect(component.maturityDate)
      .toBe('2026-12-31');

    expect(component.estimatedMaturityAmount)
      .toBe(6000);

    expect(component.totalInstallments)
      .toBe(12);

    expect(component.paidInstallments)
      .toBe(5);

    expect(component.remainingInstallments)
      .toBe(7);

    expect(component.statements.length)
      .toBe(2);

    expect(component.loading)
      .toBeFalse();

  });

  it('should handle API error while loading statement', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush(
      'Error',
      {
        status: 500,
        statusText: 'Server Error'
      }
    );

    expect(component.loading)
      .toBeFalse();

  });




  it('should return paginated statements', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush({
      data: {
        customerName: '',
        customerId: 0,
        accountNumber: '',
        accountType: '',
        availableBalance: 0,
        transactions: []
      }
    });

    component.statements = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 }
    ];

    component.itemsPerPage = 5;

    component.currentPage = 1;

    expect(component.paginatedStatements.length)
      .toBe(5);

    component.currentPage = 2;

    expect(component.paginatedStatements.length)
      .toBe(1);

  });

  it('should calculate total pages correctly', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush({
      data: {
        customerName: '',
        customerId: 0,
        accountNumber: '',
        accountType: '',
        availableBalance: 0,
        transactions: []
      }
    });

    component.statements = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 }
    ];

    component.itemsPerPage = 5;

    expect(component.totalPages)
      .toBe(2);

  });

  it('should go to next page', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush({
      data: {
        customerName: '',
        customerId: 0,
        accountNumber: '',
        accountType: '',
        availableBalance: 0,
        transactions: []
      }
    });

    component.statements = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 }
    ];

    component.itemsPerPage = 5;

    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage)
      .toBe(2);

  });

  it('should not exceed total pages', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush({
      data: {
        customerName: '',
        customerId: 0,
        accountNumber: '',
        accountType: '',
        availableBalance: 0,
        transactions: []
      }
    });

    component.statements = [
      { id: 1 },
      { id: 2 }
    ];

    component.itemsPerPage = 5;

    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage)
      .toBe(1);

  });

  it('should go to previous page', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush({
      data: {
        customerName: '',
        customerId: 0,
        accountNumber: '',
        accountType: '',
        availableBalance: 0,
        transactions: []
      }
    });

    component.currentPage = 2;

    component.previousPage();

    expect(component.currentPage)
      .toBe(1);

  });

  it('should not go below page 1', () => {

    const req = httpMock.expectOne(
      'https://localhost:7085/api/transactions/statement/1234567890'
    );

    req.flush({
      data: {
        customerName: '',
        customerId: 0,
        accountNumber: '',
        accountType: '',
        availableBalance: 0,
        transactions: []
      }
    });

    component.currentPage = 1;

    component.previousPage();

    expect(component.currentPage)
      .toBe(1);

  });

});
