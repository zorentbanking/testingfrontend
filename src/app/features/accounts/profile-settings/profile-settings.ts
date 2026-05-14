import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService }
  from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.html',
  styleUrls: ['./profile-settings.css'],
  standalone: false
})
export class ProfileSettingsComponent implements OnInit {

  profileErrorMessage: string = '';
  profileSuccessMessage: string = '';
  passwordErrorMessage: string = '';
passwordSuccessMessage: string = '';

pinErrorMessage: string = '';
pinSuccessMessage: string = '';

  profileForm!: FormGroup;

  showPassword = false;

  isKycApplied = false;
  userName: string = '';

  userEmail: string = '';

  userPhone: string = '';

  userAddress: string = '';

  userUsername: string = '';

  transactionCount: number = 0;

  totalBalance: number = 0;
  isProfileOpen: boolean = false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private profileService: ProfileService
  ) { }
  todayDate: string = new Date().toISOString().split('T')[0];

  ageValidator(control: any) {

    if (!control.value) {
      return null;
    }

    const dob = new Date(control.value);

    if (isNaN(dob.getTime())) {
      return { invalidDate: true };
    }

    if (dob.getFullYear() < 1753) {
      return { invalidYear: true };
    }

    const today = new Date();

    if (dob > today) {
      return { futureDate: true };
    }

    let age =
      today.getFullYear() - dob.getFullYear();

    const monthDifference =
      today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < dob.getDate()
      )
    ) {
      age--;
    }

    if (age < 18) {
      return { underAge: true };
    }

    return null;
  }

  ngOnInit(): void {
    const user =
      JSON.parse(localStorage.getItem('user') || '{}');

    this.userName =
      user.fullName || 'User';

    this.userUsername =
      user.username || '';

    this.profileForm = this.fb.group({

      // FULL NAME
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+$/)
        ]
      ],

      // EMAIL
      email: [
        {
          value: '',
          disabled: true
        }
      ],

      // USERNAME
      username: [
        {
          value: '',
          disabled: true
        }
      ],

      // PHONE
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?!0{10}$)[6-9][0-9]{9}$/)
        ]
      ],

      // DATE OF BIRTH
      dateOfBirth: [
        '',
        [
          Validators.required,
          this.ageValidator
        ]
      ],

      // ADDRESS
      address: [
        '',
        [
          Validators.required,
          Validators.maxLength(1500)
        ]
      ],

      // CURRENT PASSWORD
      currentPassword: [''],

      // NEW PASSWORD
      newPassword: [
        '',
        [
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
          )
        ]
      ],

      // CONFIRM PASSWORD
      confirmPassword: [''],

      // CURRENT PIN
      currentPin: [''],

      // NEW PIN
      newPin: [
        '',
        [
          Validators.pattern(/^[0-9]{4}$/)
        ]
      ],

      // CONFIRM PIN
      confirmPin: ['']
    });

    this.loadProfile();
  }
  loadProfile(): void {

    this.profileService
      .getProfile()
      .subscribe({

        next: (res: any) => {

          const user = res.data;

          this.profileForm.patchValue({

            fullName:
              user.fullName,

            username:
              user.username,

            email:
              user.email,

            phone:
              user.phone,

            address:
              user.address,

            dateOfBirth:
              user.dateOfBirth
                ?.split('T')[0]
          });

          // SIDEBAR DATA
          this.userName =
            user.fullName;

          this.userEmail =
            user.email;

          this.userPhone =
            user.phone;

          this.userAddress =
            user.address;

          this.userUsername =
            user.username;
        },

        error: (err) => {

          console.log(err);
        }
      });
  }
  toggleProfile(): void {

    this.isProfileOpen =
      !this.isProfileOpen;
  }

  
  togglePassword(): void {

    this.showPassword = !this.showPassword;
  }

  saveProfile(): void {

    this.profileErrorMessage = '';
    this.profileSuccessMessage = '';

    if (this.profileForm.invalid) {

      this.profileForm.markAllAsTouched();

      this.profileErrorMessage =
        'Please fill the highlighted fields correctly';

      return;
    }

    const payload = {

      fullName:
        this.profileForm.value.fullName,

      phone:
        this.profileForm.value.phone,

      address:
        this.profileForm.value.address,

      dateOfBirth:
        this.profileForm.value.dateOfBirth
    };

    this.profileService
      .updateProfile(payload)
      .subscribe({

        next: (res: any) => {

          this.profileSuccessMessage =
            res.message || 'Profile updated successfully';

          const storedUser =
            JSON.parse(
              localStorage.getItem('user') || '{}'
            );

          storedUser.fullName =
            this.profileForm.value.fullName;

          storedUser.phone =
            this.profileForm.value.phone;

          storedUser.address =
            this.profileForm.value.address;

          localStorage.setItem(
            'user',
            JSON.stringify(storedUser)
          );

          this.loadProfile();
        },

        error: (err) => {

          console.log(err);

          this.profileErrorMessage =
            'Failed to update profile';
        }
      });
  }

  applyKyc(): void {

    this.isKycApplied = true;

    alert('KYC Application Submitted Successfully');
  }

  changePassword(): void {

    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    const currentPassword =
      this.profileForm.value.currentPassword;

    const newPassword =
      this.profileForm.value.newPassword;

    const confirmPassword =
      this.profileForm.value.confirmPassword;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      this.passwordErrorMessage =
        'Please fill all password fields';

      return;
    }

    if (newPassword !== confirmPassword) {

      this.passwordErrorMessage =
        'New Password and Confirm Password do not match';

      return;
    }

    const payload = {

      currentPassword,

      newPassword
    };

    this.profileService
      .changePassword(payload)
      .subscribe({

        next: (res: any) => {

          this.passwordSuccessMessage =
            'Password changed successfully. Please login again.';

          this.profileForm.patchValue({

            currentPassword: '',

            newPassword: '',

            confirmPassword: ''
          });

          setTimeout(() => {

            localStorage.clear();

            this.router.navigate(['/login']);

          }, 1500);
        },

        error: (err: any) => {

          this.passwordErrorMessage =
            err.error?.message ||
            'Password change failed';
        }
      });
  }
  changeTransactionPin(): void {

    this.pinErrorMessage = '';
    this.pinSuccessMessage = '';

    const currentPin =
      this.profileForm.get('currentPin')?.value;

    const newPin =
      this.profileForm.get('newPin')?.value;

    const confirmPin =
      this.profileForm.get('confirmPin')?.value;

    if (
      !currentPin ||
      !newPin ||
      !confirmPin
    ) {

      this.pinErrorMessage =
        'Please fill all PIN fields';

      return;
    }

    if (newPin !== confirmPin) {

      this.pinErrorMessage =
        'New PIN and Confirm PIN do not match';

      return;
    }

    if (newPin.length !== 4) {

      this.pinErrorMessage =
        'PIN must contain exactly 4 digits';

      return;
    }

    this.pinSuccessMessage =
      'Transaction PIN changed successfully';

    this.profileForm.patchValue({

      currentPin: '',

      newPin: '',

      confirmPin: ''
    });
  }


  logout(): void {

    localStorage.clear();

    this.router.navigate(['/login']);
  }
  scrollToSection(sectionId: string): void {

    const element =
      document.getElementById(sectionId);

    if (element) {

      element.scrollIntoView({

        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  get fullName() {
    return this.profileForm.get('fullName');
  }

  get phone() {
    return this.profileForm.get('phone');
  }

  get dateOfBirth() {
    return this.profileForm.get('dateOfBirth');
  }

  get address() {
    return this.profileForm.get('address');
  }

  get newPassword() {
    return this.profileForm.get('newPassword');
  }

  get newPin() {
    return this.profileForm.get('newPin');
  }


}

