import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { RouterTestingModule } from '@angular/router/testing';

describe('ForgotPasswordComponent', () => {

  let component: ForgotPasswordComponent;

  let fixture: ComponentFixture<ForgotPasswordComponent>;

  let httpMock: HttpTestingController;

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [
        ForgotPasswordComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]

    }).compileComponents();

    fixture =
      TestBed.createComponent(
        ForgotPasswordComponent
      );

    component = fixture.componentInstance;

    httpMock =
      TestBed.inject(HttpTestingController);

    fixture.detectChanges();

  });

  afterEach(() => {

    httpMock.verify();

  });

  // ------------------------------------------------

  it('should create component', () => {

    expect(component).toBeTruthy();

  });

  // ------------------------------------------------

  it('should have email field invalid initially', () => {

    const emailControl =
      component.forgotPasswordForm.get('email');

    expect(emailControl?.valid)
      .toBeFalse();

  });

  // ------------------------------------------------

  it('should validate required email', () => {

    const emailControl =
      component.forgotPasswordForm.get('email');

    emailControl?.setValue('');

    expect(
      emailControl?.errors?.['required']
    ).toBeTruthy();

  });

  // ------------------------------------------------

  it('should validate email format', () => {

    const emailControl =
      component.forgotPasswordForm.get('email');

    emailControl?.setValue('invalid');

    expect(
      emailControl?.errors?.['email']
    ).toBeTruthy();

  });

  // ------------------------------------------------

  it('should accept valid email', () => {

    const emailControl =
      component.forgotPasswordForm.get('email');

    emailControl?.setValue('test@gmail.com');

    expect(emailControl?.valid)
      .toBeTruthy();

  });

  // ------------------------------------------------

  it('should not call API if form is invalid', () => {

    component.forgotPasswordForm.setValue({

      email: ''

    });

    component.onSubmit();

    httpMock.expectNone(
      'https://localhost:7085/api/auth/forgot-password'
    );

  });



});
