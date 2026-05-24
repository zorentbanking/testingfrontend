import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { Router } from '@angular/router';

import { AccountSuccessComponent }
  from './account-success';

describe('AccountSuccessComponent', () => {

  let component: AccountSuccessComponent;

  let fixture:
    ComponentFixture<AccountSuccessComponent>;

  let router: any;

  beforeEach(async () => {

    const routerSpy = jasmine.createSpyObj(
      'Router',
      [
        'navigate',
        'getCurrentNavigation'
      ]
    );

    await TestBed.configureTestingModule({

      declarations: [
        AccountSuccessComponent
      ],

      providers: [
        {
          provide: Router,
          useValue: routerSpy
        }
      ]

    }).compileComponents();

    fixture =
      TestBed.createComponent(
        AccountSuccessComponent
      );

    component =
      fixture.componentInstance;

    router = TestBed.inject(Router) as any;
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard on goDashboard()', () => {

    component.goDashboard();

    expect(router.navigate)
      .toHaveBeenCalledWith(
        ['/dashboard'],
        {
          replaceUrl: true
        }
      );
  });

  it('should set currency symbol', () => {

    expect(component.currencySymbol)
      .toBeDefined();
  });


});
