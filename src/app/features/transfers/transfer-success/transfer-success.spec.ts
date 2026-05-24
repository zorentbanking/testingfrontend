import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TransferSuccessComponent } from './transfer-success';
import { APP_CONSTANTS } from '../../../app.constants';

describe('TransferSuccessComponent', () => {
  let component: TransferSuccessComponent;
  let fixture: ComponentFixture<TransferSuccessComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [TransferSuccessComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransferSuccessComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Reset history state after every test
    history.replaceState({}, '');
  });

  it('should create', () => {
    history.replaceState(
      {
        transaction: {
          amount: 1000
        }
      },
      ''
    );

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should initialize transaction from history state', () => {
    const mockTransaction = {
      transactionId: 'TXN123',
      amount: 5000,
      receiver: 'John'
    };

    history.replaceState(
      {
        transaction: mockTransaction
      },
      ''
    );

    component.ngOnInit();

    expect(component.transaction).toEqual(mockTransaction);
  });

  it('should navigate to dashboard if transaction is not available', () => {
    history.replaceState({}, '');

    component.ngOnInit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/dashboard']
    );
  });

  it('should not navigate to dashboard when transaction exists', () => {
    history.replaceState(
      {
        transaction: {
          amount: 1000
        }
      },
      ''
    );

    component.ngOnInit();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should set currency symbol from APP_CONSTANTS', () => {
    expect(component.currencySymbol)
      .toBe(APP_CONSTANTS.currencySymbol);
  });

  it('should call goDashboard and navigate with replaceUrl true', () => {
    component.goDashboard();

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/dashboard'],
      {
        replaceUrl: true
      }
    );
  });

  it('should log transaction in console when transaction exists', () => {
    const consoleSpy = spyOn(console, 'log');

    const mockTransaction = {
      amount: 2000,
      receiver: 'Test User'
    };

    history.replaceState(
      {
        transaction: mockTransaction
      },
      ''
    );

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith(mockTransaction);
  });

  it('should return after navigating when transaction is missing', () => {
    history.replaceState({}, '');

    component.ngOnInit();

    expect(component.transaction).toBeUndefined();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/dashboard']
    );
  });
});
