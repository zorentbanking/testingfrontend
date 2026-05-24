import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {

  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({

      declarations: [RegisterComponent],

      imports: [ReactiveFormsModule],

      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });


  it('should create', () => {

    expect(component).toBeTruthy();

  });



  it('should initialize form', () => {

    expect(component.registerForm).toBeTruthy();

  });

  it('should have all form controls', () => {

    expect(component.fullName).toBeTruthy();
    expect(component.email).toBeTruthy();
    expect(component.phone).toBeTruthy();
    expect(component.dateOfBirth).toBeTruthy();
    expect(component.address).toBeTruthy();
    expect(component.username).toBeTruthy();
    expect(component.password).toBeTruthy();

  });



  it('should make fullName required', () => {

    component.fullName?.setValue('');

    expect(component.fullName?.valid).toBeFalse();

  });

  it('should validate fullName pattern', () => {

    component.fullName?.setValue('1234');

    expect(component.fullName?.valid).toBeFalse();

  });

  it('should validate email pattern', () => {

    component.email?.setValue('invalidemail');

    expect(component.email?.valid).toBeFalse();

  });

  it('should validate phone number', () => {

    component.phone?.setValue('1234567890');

    expect(component.phone?.valid).toBeFalse();

  });

  it('should validate username starts with letter', () => {

    component.username?.setValue('1user');

    expect(component.username?.valid).toBeFalse();

  });

  it('should validate password strength', () => {

    component.password?.setValue('weak');

    expect(component.password?.valid).toBeFalse();

  });



  it('should return underAge error for age below 18', () => {

    const control = component.registerForm.get('dateOfBirth');

    const today = new Date();

    const year = today.getFullYear() - 10;

    control?.setValue(`${year}-01-01`);

    expect(control?.errors?.['underAge']).toBeTruthy();

  });

  it('should return futureDate error for future DOB', () => {

    const control = component.registerForm.get('dateOfBirth');

    const futureDate = new Date();

    futureDate.setDate(futureDate.getDate() + 1);

    control?.setValue(futureDate.toISOString().split('T')[0]);

    expect(control?.errors?.['futureDate']).toBeTruthy();

  });

  it('should accept valid age above 18', () => {

    const control = component.registerForm.get('dateOfBirth');

    const today = new Date();

    const year = today.getFullYear() - 25;

    control?.setValue(`${year}-01-01`);

    expect(control?.valid).toBeTrue();

  });



  it('should detect startsWithNumber', () => {

    expect(component.startsWithNumber('1abc')).toBeTrue();

  });

  it('should return false when not starting with number', () => {

    expect(component.startsWithNumber('abc')).toBeFalse();

  });

  it('should validate startsWithLetter', () => {

    expect(component.startsWithLetter('abc')).toBeTrue();

  });

  it('should invalidate startsWithLetter', () => {

    expect(component.startsWithLetter('1abc')).toBeFalse();

  });

  it('should validate username characters', () => {

    expect(component.containsValidUsernameChars('user_123')).toBeTrue();

  });

  it('should invalidate special characters in username', () => {

    expect(component.containsValidUsernameChars('user@123')).toBeFalse();

  });


  it('should submit form successfully', fakeAsync(() => {

    authServiceSpy.register.and.returnValue(
      of({
        success: true,
        message: 'Registration successful'
      })
    );

    component.registerForm.setValue({

      fullName: 'Greeshma',
      email: 'test@gmail.com',
      phone: '9876543210',
      dateOfBirth: '2000-01-01',
      address: 'Hyderabad',
      username: 'greeshma123',
      password: 'Test@123'

    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalled();

    expect(component.successMessage)
      .toBe('Registration successful');

    tick(1500);

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/login'],
      {
        state: {
          message: 'Registration successful'
        }
      }
    );

  }));


  it('should not submit invalid form', () => {

    component.registerForm.setValue({

      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      username: '',
      password: ''

    });

    component.onSubmit();

    expect(component.errorMessage)
      .toBe('Please correct the highlighted fields');

    expect(authServiceSpy.register)
      .not.toHaveBeenCalled();

  });



  it('should handle API error', () => {

    authServiceSpy.register.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Registration failed'
        }
      }))
    );

    component.registerForm.setValue({

      fullName: 'Greeshma',
      email: 'test@gmail.com',
      phone: '9876543210',
      dateOfBirth: '2000-01-01',
      address: 'Hyderabad',
      username: 'greeshma123',
      password: 'Test@123'

    });

    component.onSubmit();

    expect(component.errorMessage)
      .toBe('Registration failed');

  });

});
