// profile-settings.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProfileSettingsComponent } from './profile-settings';
import { ProfileService } from '../../../core/services/profile.service';

describe('ProfileSettingsComponent', () => {

  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;

  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    profileServiceSpy = jasmine.createSpyObj(
      'ProfileService',
      [
        'getProfile',
        'updateProfile',
        'changePassword'
      ]
    );

    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate']
    );

    profileServiceSpy.getProfile.and.returnValue(
      of({
        data: {
          fullName: 'Greeshma',
          username: 'greeshma123',
          email: 'greeshma@test.com',
          phone: '9876543210',
          address: 'Hyderabad',
          dateOfBirth: '2000-01-01T00:00:00'
        }
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProfileSettingsComponent],
      providers: [
        FormBuilder,
        {
          provide: ProfileService,
          useValue: profileServiceSpy
        },
        {
          provide: Router,
          useValue: routerSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsComponent);

    component = fixture.componentInstance;

    localStorage.setItem(
      'user',
      JSON.stringify({
        fullName: 'Greeshma',
        username: 'greeshma123',
        phone: '9876543210',
        address: 'Hyderabad'
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

  it('should initialize form', () => {

    expect(component.profileForm).toBeTruthy();

    expect(component.profileForm.contains('fullName')).toBeTrue();

    expect(component.profileForm.contains('phone')).toBeTrue();

    expect(component.profileForm.contains('address')).toBeTrue();
  });

  it('should load profile data', () => {

    expect(component.profileForm.value.fullName)
      .toBe('Greeshma');

    expect(component.userEmail)
      .toBe('greeshma@test.com');

    expect(component.userPhone)
      .toBe('9876543210');
  });

  it('should toggle profile', () => {

    component.isProfileOpen = false;

    component.toggleProfile();

    expect(component.isProfileOpen).toBeTrue();

    component.toggleProfile();

    expect(component.isProfileOpen).toBeFalse();
  });

  it('should toggle password', () => {

    component.showPassword = false;

    component.togglePassword();

    expect(component.showPassword).toBeTrue();
  });

  it('should show error when profile form is invalid', () => {

    component.profileForm.patchValue({
      fullName: '',
      phone: '',
      address: ''
    });

    component.saveProfile();

    expect(component.profileErrorMessage)
      .toContain('Please fill');
  });

  it('should save profile successfully', () => {

    profileServiceSpy.updateProfile.and.returnValue(
      of({
        message: 'Profile updated successfully'
      })
    );

    component.profileForm.patchValue({
      fullName: 'Greeshma',
      phone: '9876543210',
      address: 'Hyderabad'
    });

    component.saveProfile();

    expect(profileServiceSpy.updateProfile)
      .toHaveBeenCalled();

    expect(component.profileSuccessMessage)
      .toBe('Profile updated successfully');
  });

  it('should handle profile update error', () => {

    profileServiceSpy.updateProfile.and.returnValue(
      throwError(() => new Error('Error'))
    );

    component.profileForm.patchValue({
      fullName: 'Greeshma',
      phone: '9876543210',
      address: 'Hyderabad'
    });

    component.saveProfile();

    expect(component.profileErrorMessage)
      .toBe('Failed to update profile');
  });

  it('should apply KYC', () => {

    spyOn(window, 'alert');

    component.applyKyc();

    expect(component.isKycApplied)
      .toBeTrue();

    expect(window.alert)
      .toHaveBeenCalled();
  });

  it('should show error if password fields are empty', () => {

    component.profileForm.patchValue({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    component.changePassword();

    expect(component.passwordErrorMessage)
      .toBe('Please fill all password fields');
  });

  it('should show error when passwords do not match', () => {

    component.profileForm.patchValue({
      currentPassword: 'Old@123',
      newPassword: 'New@123',
      confirmPassword: 'Wrong@123'
    });

    component.changePassword();

    expect(component.passwordErrorMessage)
      .toContain('do not match');
  });

  it('should change password successfully', fakeAsync(() => {

    profileServiceSpy.changePassword.and.returnValue(
      of({
        message: 'Success'
      })
    );

    component.profileForm.patchValue({
      currentPassword: 'Old@123',
      newPassword: 'New@123',
      confirmPassword: 'New@123'
    });

    component.changePassword();

    expect(component.passwordSuccessMessage)
      .toContain('Password changed successfully');

    tick(1500);

    expect(routerSpy.navigate)
      .toHaveBeenCalledWith(['/login']);
  }));

  it('should handle password change error', () => {

    profileServiceSpy.changePassword.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Password change failed'
        }
      }))
    );

    component.profileForm.patchValue({
      currentPassword: 'Old@123',
      newPassword: 'New@123',
      confirmPassword: 'New@123'
    });

    component.changePassword();

    expect(component.passwordErrorMessage)
      .toBe('Password change failed');
  });

  it('should show pin error when fields are empty', () => {

    component.profileForm.patchValue({
      currentPin: '',
      newPin: '',
      confirmPin: ''
    });

    component.changeTransactionPin();

    expect(component.pinErrorMessage)
      .toBe('Please fill all PIN fields');
  });

  it('should show error when pin does not match', () => {

    component.profileForm.patchValue({
      currentPin: '1234',
      newPin: '1111',
      confirmPin: '2222'
    });

    component.changeTransactionPin();

    expect(component.pinErrorMessage)
      .toContain('do not match');
  });

  it('should show error for invalid pin length', () => {

    component.profileForm.patchValue({
      currentPin: '1234',
      newPin: '123',
      confirmPin: '123'
    });

    component.changeTransactionPin();

    expect(component.pinErrorMessage)
      .toBe('PIN must contain exactly 4 digits');
  });

  it('should change transaction pin successfully', () => {

    component.profileForm.patchValue({
      currentPin: '1234',
      newPin: '5678',
      confirmPin: '5678'
    });

    component.changeTransactionPin();

    expect(component.pinSuccessMessage)
      .toBe('Transaction PIN changed successfully');
  });

  it('should logout user', () => {

    component.logout();

    expect(routerSpy.navigate)
      .toHaveBeenCalledWith(['/login']);
  });

  it('should set section and clear messages', () => {

    component.profileErrorMessage = 'error';
    component.passwordErrorMessage = 'error';
    component.pinErrorMessage = 'error';

    component.setSection('security');

    expect(component.activeSession)
      .toBe('security');

    expect(component.profileErrorMessage)
      .toBe('');

    expect(component.passwordErrorMessage)
      .toBe('');

    expect(component.pinErrorMessage)
      .toBe('');
  });

  it('should validate under age', () => {

    const control = {
      value: '2020-01-01'
    };

    const result = component.ageValidator(control);

    expect(result?.underAge).toBeTrue();
  });

  it('should validate future date', () => {

    const futureDate = new Date();

    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const control = {
      value: futureDate.toISOString().split('T')[0]
    };

    const result = component.ageValidator(control);

    expect(result?.futureDate).toBeTrue();
  });

  it('should validate invalid year', () => {

    const control = {
      value: '1700-01-01'
    };

    const result = component.ageValidator(control);

    expect(result?.invalidYear).toBeTrue();
  });

  it('should return null for valid age', () => {

    const control = {
      value: '2000-01-01'
    };

    const result = component.ageValidator(control);

    expect(result).toBeNull();
  });

  it('should get fullName control', () => {

    expect(component.fullName)
      .toBeTruthy();
  });

  it('should get phone control', () => {

    expect(component.phone)
      .toBeTruthy();
  });

  it('should get address control', () => {

    expect(component.address)
      .toBeTruthy();
  });

  it('should get newPassword control', () => {

    expect(component.newPassword)
      .toBeTruthy();
  });

  it('should get newPin control', () => {

    expect(component.newPin)
      .toBeTruthy();
  });

});
